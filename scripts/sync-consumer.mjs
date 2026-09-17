#!/usr/bin/env node
/**
 * PUT THE ENGINE YOU JUST BUILT UNDER THE APP THAT USES IT.
 *
 * A consumer outside this repository installs the engine from the registry, so
 * nothing done here reaches it until a release: every fix lands in the engine's
 * own fixture, and the product carries a workaround until the version it needs
 * exists. That is the right default - it is how `docs/ENGINE_PRODUCT_FUSION.md`
 * came to be written, and testing against the PUBLISHED engine is what found
 * most of what is in it - but it is a poor loop for a fix you want to see in the
 * product today.
 *
 * So: build the packages, then copy each one's `distribution/` over the copy
 * pnpm extracted into the consumer's store. Nothing in either repository's
 * manifests changes, nothing is committed, CI never sees it, and
 * `pnpm install` in the consumer puts the registry's copy back.
 *
 *   pnpm sync <path-to-consumer>        build, then sync
 *   pnpm sync <path> --no-build         sync what is already built
 *   pnpm sync <path> --check            report what differs, change nothing
 *   pnpm sync <path> --status           what each copy runs: the registry's, or synced from <commit>
 *
 * `--check` compares CONTENT (a digest of every file under `distribution/`),
 * never a directory's mtime: a rebuild that emitted the same bytes is not
 * stale, and a copy touched by an install is not fresh. Every synced copy
 * carries a `.synced-from.json` stamp (`{ commit, dirty, at, version }`) so a
 * product can say `synced from <commit>` where it shows its engine version, and
 * refuse to verify against unpublished code (dechat: `DECHAT_REQUIRE_REGISTRY=1`).
 *
 * A synced consumer is running code that does not exist on the registry. Say so
 * when reporting a result from it, and put it back with `pnpm install` there
 * before trusting anything about the published engine.
 */
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { cpSync, existsSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');

const args = process.argv.slice(2).filter((argument) => !argument.startsWith('--'));
const flags = new Set(process.argv.slice(2).filter((argument) => argument.startsWith('--')));

const consumer = resolve(args[0] || '');


/** This workspace's publishable packages, from pnpm itself. */
const packages = () => {
    const output = execFileSync(
        'pnpm', ['-r', 'ls', '--depth', '-1', '--json'],
        { cwd: root, stdio: ['ignore', 'pipe', 'ignore'], timeout: 120_000 },
    ).toString();

    return JSON.parse(output)
        .filter((project) => project.name
            && !project.private
            && !project.path.includes('/fixtures/'))
        .map((project) => ({ name: project.name, directory: project.path }));
};


/**
 * Every extracted copy of a package in the consumer's pnpm store.
 *
 * ALL of them, not the one the consumer's manifest names: a store holds a
 * directory per version and per peer-resolution, and a transitive dependency
 * can hold a different one. Syncing the manifest's copy alone leaves the app
 * running a mixture of two engines, which is worse than running the old one.
 */
const copiesIn = (store, name) => {
    const prefix = '@plurid+' + name.replace('@plurid/', '') + '@';

    return readdirSync(store)
        .filter((entry) => entry.startsWith(prefix))
        .map((entry) => join(store, entry, 'node_modules', name))
        .filter((path) => existsSync(join(path, 'package.json')));
};


/** The stamp a synced copy carries. */
const STAMP = '.synced-from.json';


/** A digest of a directory's CONTENT: every file's path and bytes, in one order. */
export const digestOf = (
    directory,
) => {
    const hash = createHash('sha256');
    const walk = (current) => {
        for (const entry of readdirSync(current, { withFileTypes: true }).sort((a, b) => (a.name < b.name ? -1 : 1))) {
            const path = join(current, entry.name);
            if (entry.isDirectory()) {
                walk(path);
            } else if (entry.name !== STAMP) {
                hash.update(relative(directory, path));
                hash.update('\0');
                hash.update(readFileSync(path));
                hash.update('\0');
            }
        }
    };
    if (existsSync(directory)) {
        walk(directory);
    }
    return hash.digest('hex');
};


/** This checkout, for the stamp: the commit, and whether the working tree differs from it. */
const provenance = () => {
    const run = (command) => {
        try {
            return execFileSync('git', command, { cwd: root, stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim();
        } catch {
            return '';
        }
    };
    const commit = run(['rev-parse', '--short', 'HEAD']) || 'unknown';
    const dirty = run(['status', '--porcelain']).length > 0;
    return { commit, dirty };
};


const readStamp = (
    copy,
) => {
    const path = join(copy, 'distribution', STAMP);
    if (!existsSync(path)) {
        return undefined;
    }
    try {
        return JSON.parse(readFileSync(path, 'utf8'));
    } catch {
        return undefined;
    }
};


const main = () => {
    if (!args[0]) {
        console.error('sync: which consumer? pass the path to its repository root');
        process.exit(1);
    }

    const store = join(consumer, 'node_modules', '.pnpm');
    if (!existsSync(store)) {
        console.error(`sync: no pnpm store under ${consumer} - is it installed?`);
        process.exit(1);
    }

    if (!flags.has('--no-build') && !flags.has('--check') && !flags.has('--status')) {
        console.log('sync: building');
        execFileSync('pnpm', ['-r', 'build'], { cwd: root, stdio: 'inherit' });
    }

    const from = provenance();
    let synced = 0;
    let stale = 0;
    let missing = 0;

    for (const project of packages()) {
        const built = join(project.directory, 'distribution');
        if (!existsSync(built)) {
            continue;
        }

        const copies = copiesIn(store, project.name);
        if (copies.length === 0) {
            missing += 1;
            continue;
        }

        for (const copy of copies) {
            const target = join(copy, 'distribution');
            const version = JSON.parse(readFileSync(join(copy, 'package.json'), 'utf8')).version;

            if (flags.has('--status')) {
                const stamp = readStamp(copy);
                console.log(stamp
                    ? `  ${project.name}@${version}: synced from ${stamp.commit}${stamp.dirty ? ' (dirty)' : ''} at ${stamp.at}`
                    : `  ${project.name}@${version}: the registry's`);
                continue;
            }

            if (flags.has('--check')) {
                // by content: the same bytes are never stale, whatever the clocks say
                if (digestOf(built) !== digestOf(target)) {
                    console.log(`  stale  ${project.name}@${version}`);
                    stale += 1;
                }
                continue;
            }

            // replaced, not merged: a file the build stopped emitting has to
            // stop existing, or the app keeps importing something the engine
            // no longer has
            rmSync(target, { recursive: true, force: true });
            cpSync(built, target, { recursive: true });
            writeFileSync(join(target, STAMP), JSON.stringify({
                commit: from.commit,
                dirty: from.dirty,
                at: new Date().toISOString(),
                version,
                package: project.name,
            }, null, 4) + '\n');
            console.log(`  synced ${project.name}@${version} (from ${from.commit}${from.dirty ? ', dirty' : ''})`);
            synced += 1;
        }
    }

    if (flags.has('--status')) {
        return;
    }

    if (flags.has('--check')) {
        console.log(stale === 0
            ? 'sync: the consumer is up to date with this build'
            : `sync: ${stale} stale, run without --check`);
        process.exit(stale === 0 ? 0 : 1);
    }

    console.log(`sync: ${synced} copied${missing > 0 ? `, ${missing} not used by this consumer` : ''}`);
    console.log(`sync: ${consumer} is now running UNPUBLISHED code - \`pnpm install\` there puts the registry's copy back`);
};

main();
