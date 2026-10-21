#!/usr/bin/env node
/** Prepare, verify immutable tarballs, then publish explicitly. No phase removes files. */
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
    changedFiles, listWorkspace, parseReleaseArguments,
    planRelease, registryPackage, resumableArtifacts, rememberArtifacts, verifyArtifacts, verifyArtifactSource,
} from './release-plan.mjs';
import { packRelease } from './release-pack.mjs';
import { publishArtifacts, verifyPublication } from './release-publish.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const say = (message) => console.log(`[release] ${message}`);
const run = (file, args, cwd = root, extra = {}) => execFileSync(file, args, {
    cwd, stdio: 'inherit', env: { ...process.env, PLURID_PRESERVE_ARTIFACTS: '1', SMOKE_SKIP_GENERATE: '', SMOKE_SKIP_BROWSER: '', PLURID_E2E_OWN_SERVER: '1' }, ...extra,
});
const read = (file, args) => run(file, args, root, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'inherit'] }).trim();
const writeJSON = (file, value) => writeFileSync(file, JSON.stringify(value, null, 4) + '\n');
const head = () => read('git', ['rev-parse', 'HEAD']);
const clean = () => {
    if (read('git', ['status', '--porcelain'])) throw new Error('Commit the final source, versions and lockfile first.');
};

const usage = `Usage:
  pnpm release --dry-run [--all]    Read-only plan; no login, fetch, build or packing
  pnpm release --prepare [--all]    Update manifests, peer minimums and workspace lockfile
  pnpm release --pack [new-dir]    Build and verify; automatically choose and remember artifacts
  pnpm release --publish [dir]     Reuse verified artifacts or build them, then publish to latest
  pnpm release --verify-registry [dir]  Confirm exact versions, integrity and latest tags
  --wait <seconds>                 Shared npm availability timeout (default 1200; 0 checks once)

Commit and push preparation before the final CI run. --publish requires green CI on that commit.
Artifact locations are remembered under .out/releases; explicit paths remain supported.
Publisher-only fixes can resume the same tested tarballs from an ancestor commit. Builds and failed work are kept;
--publish resumes compatible verified artifacts without rebuilding them. No phase bumps
versions except --prepare, and no phase commits, pushes or cleans files.`;

if (args.includes('--help')) {
    console.log(usage);
    process.exit(0);
}
const { mode, directory: directoryArg, all, noBump, waitSeconds } = parseReleaseArguments(args);

const projects = listWorkspace(root);

const prepare = async () => {
    const tag = read('git', ['tag', '-l', 'release/*', '--sort=-creatordate']).split('\n')[0];
    const published = Object.fromEntries(await Promise.all(projects.map(async ({ data }) => [
        data.name, (await registryPackage(data.name))?.version ?? null,
    ])));
    const plan = planRelease({ projects, published, files: tag ? changedFiles(root, tag) : [],
        root, all, noBump });
    say(`baseline: ${tag || 'none'}; all changes in the working tree are included`);
    for (const entry of plan) {
        say(`${entry.name}: ${entry.published ?? 'unpublished'} → ${entry.target} (${entry.why})`);
    }
    if (mode === '--dry-run') {
        say('Read-only plan complete. Use --prepare to write versions; no publishing has run.');
        return;
    }
    const moved = new Map(plan.filter((entry) => entry.target !== entry.published).map((entry) => [entry.name, entry.target]));
    for (const entry of plan) {
        const manifest = structuredClone(entry.data);
        manifest.version = entry.target;
        for (const [name, target] of moved) {
            if (manifest.peerDependencies?.[name]?.startsWith('>=')) manifest.peerDependencies[name] = `>=${target}`;
        }
        if (JSON.stringify(manifest) !== JSON.stringify(entry.data)) writeJSON(entry.manifest, manifest);
    }
    run('pnpm', ['install', '--lockfile-only', '--ignore-scripts']);
    say('Prepared. Review and commit the versions, lockfile and release code; push and wait for CI.');
    say('Then use --pack to review artifacts, or --publish to build, verify and publish. No packages have been published.');
};

const pack = () => {
    clean();
    const directory = packRelease({ root, sourceCommit: head(), directoryArg, say });
    say(`Verified tarballs: ${directory}.` + (mode === '--pack' ? ' Run pnpm release --publish to publish these exact artifacts.' : ''));
    return directory;
};

const artifacts = (directory) => {
    const manifest = JSON.parse(readFileSync(join(directory, 'release.json'), 'utf8'));
    verifyArtifactSource(root, manifest.sourceCommit, head());
    const entries = verifyArtifacts(manifest, projects, manifest.sourceCommit, (file) => readFileSync(join(directory, file)))
        .map((entry) => ({ ...entry, file: join(directory, entry.file) }));
    return { manifest, entries };
};

const publish = async () => {
    clean();
    const sourceCommit = head();
    if (mode !== '--verify-registry') {
        const ci = JSON.parse(read('gh', ['run', 'list', '--workflow', 'ci.yml', '--commit', sourceCommit,
            '--limit', '1', '--json', 'headSha,status,conclusion']));
        if (ci[0]?.headSha !== sourceCommit || ci[0]?.status !== 'completed' || ci[0]?.conclusion !== 'success') {
            throw new Error('Green CI on the prepared source commit is required before publishing.');
        }
    }
    let directory = directoryArg ? resolve(root, directoryArg) : resumableArtifacts(root, sourceCommit);
    if (!directory) {
        if (mode === '--verify-registry') throw new Error('No verified artifacts for this commit. Run --pack first or provide their directory.');
        say('No verified artifacts for this commit; building and verifying before publication.');
        directory = pack();
    }
    const { manifest, entries } = artifacts(directory);
    say('Using verified tarballs: ' + directory);
    if (head() !== sourceCommit) throw new Error('Source changed during release verification. Re-run against the intended commit.');
    const options = { directory, manifest, entries, lookup: registryPackage, log: say, timeoutMs: waitSeconds * 1000 };
    if (mode === '--verify-registry') {
        await verifyPublication(options);
        say(`All ${entries.length} exact registry versions, integrity hashes and latest tags match.`);
        return;
    }
    clean();
    rememberArtifacts(root, manifest.sourceCommit, directory);
    await publishArtifacts({ ...options,
        // Authenticate only when there are new uploads, never while resuming npm's scan.
        authenticate: () => run('pnpm', ['whoami'], root, { stdio: 'ignore' }),
        upload: (entry) => run('pnpm', ['publish', entry.file, '--access', 'public', '--tag', 'latest', '--ignore-scripts', '--no-git-checks']),
    });
    const tag = 'release/' + new Date().toISOString().slice(0, 10);
    const existing = read('git', ['tag', '-l', tag]);
    if (existing && read('git', ['rev-list', '-n', '1', tag]) !== manifest.sourceCommit) {
        throw new Error(`Published successfully; ${tag} already names another commit. Choose a distinct release tag manually.`);
    }
    if (!existing) run('git', ['tag', '-a', tag, manifest.sourceCommit, '-m', 'release ' + tag]);
    say(`All ${entries.length} packages verified on latest. Tag ${tag} is local; push it after registry consumer verification.`);
};

try {
    if (mode === '--dry-run' || mode === '--prepare') await prepare();
    else if (mode === '--pack') pack();
    else await publish();
} catch (error) {
    console.error('[release] ' + error.message);
    if (mode === '--publish') console.error('[release] Artifacts are preserved. Re-run --publish to resume this commit, or provide the same explicit directory.');
    process.exitCode = 1;
}
