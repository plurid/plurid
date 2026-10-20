import { appendFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join } from 'node:path';
import { nextVersion } from './release-plan.mjs';

/** Append-only upload receipts stay beside the exact verified tarballs, never in credentials. */
const publicationJournal = (directory, manifest) => {
    const parent = join(directory, 'publication');
    const manifestHash = createHash('sha256').update(JSON.stringify(manifest)).digest('hex');
    const path = (entry) => join(parent, encodeURIComponent(entry.name) + '@' + entry.version + '.jsonl');
    const transitions = { submitting: ['accepted', 'verified'], accepted: ['verified'], observed: ['verified'], verified: [] };
    const state = (entry) => {
        if (!existsSync(path(entry))) return null;
        let previous;
        const text = readFileSync(path(entry), 'utf8');
        if (!text.endsWith('\n')) throw new Error(`Incomplete upload receipt for ${entry.name}; preserving it for inspection.`);
        for (const line of text.trimEnd().split('\n')) {
            const record = JSON.parse(line);
            if (record.schema !== 1 || record.sourceCommit !== manifest.sourceCommit || record.manifestHash !== manifestHash
                || record.name !== entry.name || record.version !== entry.version || record.integrity !== entry.integrity
                || !Object.hasOwn(transitions, record.state)
                || (!previous && record.state === 'accepted')
                || (previous && !transitions[previous].includes(record.state))) {
                throw new Error(`Invalid upload receipt for ${entry.name}; it does not match these artifacts.`);
            }
            previous = record.state;
        }
        return previous;
    };
    const record = (entry, next) => JSON.stringify({ schema: 1, sourceCommit: manifest.sourceCommit, manifestHash,
        name: entry.name, version: entry.version, integrity: entry.integrity, state: next, at: new Date().toISOString() }) + '\n';
    const append = (entry, next) => {
        const previous = state(entry);
        if (previous === next || previous === 'verified') return;
        if ((!previous && next === 'accepted') || (previous && !transitions[previous].includes(next))) {
            throw new Error(`Invalid upload state change for ${entry.name}.`);
        }
        mkdirSync(parent, { recursive: true });
        if (previous) appendFileSync(path(entry), record(entry, next));
        else writeFileSync(path(entry), record(entry, next), { flag: 'wx' });
    };
    return {
        state,
        receipt: path,
        start: (entry) => {
            mkdirSync(parent, { recursive: true });
            // Claim before the network operation: a crash or another release process must not re-upload it.
            writeFileSync(path(entry), record(entry, 'submitting'), { flag: 'wx' });
        },
        accept: (entry) => append(entry, 'accepted'),
        observe: (entry) => { if (!state(entry)) append(entry, 'observed'); },
        verify: (entry) => append(entry, 'verified'),
    };
};

/** A visible version with a lagging latest tag is pending, never a reason to publish it again. */
const inspect = async (entry, lookup) => {
    const [published, latest] = await Promise.all([lookup(entry.name, entry.version), lookup(entry.name)]);
    if (published && published.dist?.integrity !== entry.integrity) {
        throw new Error(`${entry.name}@${entry.version}: different registry tarball; do not overwrite or rebuild it.`);
    }
    if (latest?.version === entry.version && latest.dist?.integrity && latest.dist.integrity !== entry.integrity) {
        throw new Error(`${entry.name}@${entry.version}: different registry tarball; do not overwrite or rebuild it.`);
    }
    if (latest && latest.version !== entry.version && nextVersion(latest.version) !== entry.version) {
        throw new Error(`Registry advanced to ${entry.name}@${latest.version}; the release requires ${entry.version}.`);
    }
    return { entry, present: !!published || latest?.version === entry.version,
        confirmed: !!published && latest?.version === entry.version };
};

const waitForAvailability = async ({ entries, journal, lookup, timeoutMs, log }) => {
    const pending = new Map(entries.map((entry) => [entry.name, entry]));
    const deadline = Date.now() + timeoutMs;
    let lastReport = -Infinity;
    while (pending.size) {
        // Recheck the complete graph: an early package's tag may advance while a later scan is pending.
        const states = await Promise.all(entries.map((entry) => inspect(entry, lookup)));
        pending.clear();
        for (const { entry, confirmed } of states) {
            if (confirmed) journal.verify(entry);
            else pending.set(entry.name, entry);
        }
        if (!pending.size) return;
        if (Date.now() - lastReport >= 30000) {
            log(`npm availability: ${entries.length - pending.size}/${entries.length}; waiting for the remaining packages together.`);
            lastReport = Date.now();
        }
        const remaining = deadline - Date.now();
        if (remaining <= 0) {
            // an upload whose outcome npm never reported may have been refused: say how to retry it
            const submitted = [...pending.values()].filter((entry) => journal.state(entry) === 'submitting');
            throw new Error(`npm availability pending: ${[...pending.values()].map((entry) => entry.name + '@' + entry.version).join(', ')}. `
                + 'Upload receipts are saved. Re-run --publish or --verify-registry with the same artifacts; recorded uploads will not be submitted again.'
                + (submitted.length
                    ? ' If npm rejected an upload (a one-time password or a permission error), move its receipt aside and run --publish again: '
                        + submitted.map((entry) => journal.receipt(entry)).join(', ')
                    : ''));
        }
        await new Promise((resolve) => setTimeout(resolve, Math.min(10000, remaining)));
    }
};

export const publishArtifacts = async ({ directory, manifest, entries, lookup, authenticate, upload, log = () => {}, timeoutMs = 1200000 }) => {
    const journal = publicationJournal(directory, manifest);
    // Validate every receipt and registry artifact before authenticating or uploading anything.
    const receipts = new Map(entries.map((entry) => [entry.name, journal.state(entry)]));
    const states = await Promise.all(entries.map((entry) => inspect(entry, lookup)));
    const missing = [];
    // Recorded uploads npm does not show yet: their outcome is unknown, and they are never sent again.
    const unresolved = [];
    for (const { entry, present, confirmed } of states) {
        if (confirmed) journal.verify(entry);
        else if (present) journal.observe(entry);
        else if (receipts.get(entry.name)) unresolved.push(entry);
        else missing.push(entry);
    }
    if (missing.length) {
        await authenticate();
        log(`Uploading ${missing.length} packages consecutively; npm availability is checked after all uploads.`);
    }
    for (const entry of missing) {
        // A package after an unresolved upload in dependency order waits for it: published to latest
        // without it, it pinned a version that a refused upload would never deliver (2026-10-20).
        const before = unresolved.filter((other) => entries.indexOf(other) < entries.indexOf(entry));
        if (before.length) {
            log(`Waiting for ${before.map((other) => other.name + '@' + other.version).join(', ')} before ${entry.name}.`);
            await waitForAvailability({ entries: before, journal, lookup, timeoutMs, log });
            unresolved.splice(0, unresolved.length, ...unresolved.filter((other) => !before.includes(other)));
        }
        journal.start(entry);
        log(`Publishing ${entry.name}@${entry.version} to latest`);
        await upload(entry);
        journal.accept(entry);
    }
    await waitForAvailability({ entries, journal, lookup, timeoutMs, log });
};

/** Public registry verification never authenticates or invokes a publisher. */
export const verifyPublication = async ({ directory, manifest, entries, lookup, log = () => {}, timeoutMs = 1200000 }) => {
    const journal = publicationJournal(directory, manifest);
    for (const entry of entries) journal.state(entry);
    await waitForAvailability({ entries, journal, lookup, timeoutMs, log });
};
