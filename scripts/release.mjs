#!/usr/bin/env node
/** Prepare, verify immutable tarballs, then publish explicitly. No phase removes files. */
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { closeSync, existsSync, mkdirSync, openSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
    changedFiles, listWorkspace, nextVersion, packedJSON, planRelease, registryPackage, releaseOrder, verifyArtifacts,
} from './release-plan.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const say = (message) => console.log(`[release] ${message}`);
const run = (file, args, cwd = root, extra = {}) => execFileSync(file, args, {
    cwd, stdio: 'inherit', env: { ...process.env, PLURID_PRESERVE_ARTIFACTS: '1', SMOKE_SKIP_GENERATE: '', SMOKE_SKIP_BROWSER: '' }, ...extra,
});
const read = (file, args) => run(file, args, root, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'inherit'] }).trim();
const hash = (bytes, algorithm, encoding) => createHash(algorithm).update(bytes).digest(encoding);
const writeJSON = (file, value) => writeFileSync(file, JSON.stringify(value, null, 4) + '\n');
const head = () => read('git', ['rev-parse', 'HEAD']);
const clean = () => {
    if (read('git', ['status', '--porcelain'])) throw new Error('Commit the final source, versions and lockfile first.');
};

const usage = `Usage:
  pnpm release --dry-run [--all]    Read-only plan; no login, fetch, build or packing
  pnpm release --prepare [--all]    Update manifests, peer minimums and workspace lockfile
  pnpm release --pack <new-dir>     Build fresh source, run gates, test and hash tarballs
  pnpm release --publish <dir>      Publish verified tarballs to latest; requires green CI
  pnpm release --verify-registry <dir>  Confirm exact versions, integrity and latest tags

Commit and push preparation before the final CI run. Publishing never bumps, builds, commits or
cleans. Failed and successful work directories are kept. Re-run --publish to resume a partial round.`;

const modes = ['--dry-run', '--prepare', '--pack', '--publish', '--verify-registry'];
const selected = modes.filter((mode) => args.includes(mode));
if (args.includes('--help')) {
    console.log(usage);
    process.exit(0);
}
if (selected.length > 1) throw new Error('Choose one release phase.');
const mode = selected[0] ?? '--dry-run';
const needsDirectory = ['--pack', '--publish', '--verify-registry'].includes(mode);
const directoryArg = needsDirectory ? args[args.indexOf(mode) + 1] : undefined;
if (needsDirectory && (!directoryArg || directoryArg.startsWith('--'))) throw new Error(usage);
const flags = args.filter((arg) => arg !== directoryArg);
for (const arg of flags) {
    if (![...modes, '--all', '--no-bump'].includes(arg)) throw new Error(`Unknown argument ${arg}\n${usage}`);
}
if (needsDirectory && (args.includes('--all') || args.includes('--no-bump'))) throw new Error('--all/--no-bump apply only to planning or preparation.');

const projects = listWorkspace(root);

const prepare = async () => {
    const tag = read('git', ['tag', '-l', 'release/*', '--sort=-creatordate']).split('\n')[0];
    const published = Object.fromEntries(await Promise.all(projects.map(async ({ data }) => [
        data.name, (await registryPackage(data.name))?.version ?? null,
    ])));
    const plan = planRelease({ projects, published, files: tag ? changedFiles(root, tag) : [],
        root, all: args.includes('--all'), noBump: args.includes('--no-bump') });
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
    say('Then use --pack <new-dir>. No packages have been published.');
};

const pack = () => {
    clean();
    const directory = resolve(directoryArg);
    if (existsSync(directory)) throw new Error(`Choose a new artifact directory; preserving ${directory}`);
    mkdirSync(directory, { recursive: true });
    const sourceCommit = head();
    const source = join(directory, 'source');
    mkdirSync(source);
    run('git', ['archive', '--format=tar', '--output=' + join(directory, 'source.tar'), sourceCommit]);
    run('tar', ['-xf', join(directory, 'source.tar'), '-C', source]);
    // A new store prevents a source-overlaid consumer or an old output chunk from entering the release.
    const logs = join(directory, 'logs');
    mkdirSync(logs);
    const logged = (name, file, args, cwd = source) => {
        const log = join(logs, name + '.log');
        say(name + ' → ' + log);
        const fd = openSync(log, 'wx');
        try { run(file, args, cwd, { stdio: ['ignore', fd, fd] }); }
        finally { closeSync(fd); }
    };
    logged('install', 'pnpm', ['install', '--frozen-lockfile', '--ignore-scripts', '--store-dir', join(directory, 'store')]);
    const gates = [];
    const gate = (name, file, args) => {
        logged(name, file, args);
        gates.push(name);
    };
    gate('build', process.execPath, ['scripts/build-preserving.mjs']);
    for (const script of ['test.release', 'check', 'test', 'lint', 'check.modules', 'size', 'docs.tables.check']) {
        gate(script, 'pnpm', [script === 'test' ? 'test:preserving' : script]);
    }
    for (const project of ['chromium', 'perf', 'visual']) {
        gate('e2e.' + project, 'pnpm', ['--filter', 'plurid-render-test', 'e2e', '--project=' + project,
            '--output=' + join(directory, 'e2e-' + project), ...(project === 'visual' ? ['--update-snapshots=none'] : [])]);
    }
    const tarballs = join(directory, 'tarballs');
    mkdirSync(tarballs);
    const packages = [];
    for (const project of releaseOrder(listWorkspace(source))) {
        const output = run('pnpm', ['pack', '--config.ignore-scripts=true', '--pack-destination', tarballs], project.directory,
            { encoding: 'utf8', stdio: ['ignore', 'pipe', 'inherit'] }).trim();
        const file = basename(output.split('\n').pop());
        const bytes = readFileSync(join(tarballs, file));
        const data = packedJSON(bytes);
        if (data.name !== project.data.name || data.version !== project.data.version || JSON.stringify(data).includes('workspace:')) {
            throw new Error(`Invalid packed manifest for ${project.data.name}`);
        }
        packages.push({ name: data.name, version: data.version, file: 'tarballs/' + file,
            sha256: hash(bytes, 'sha256', 'hex'), integrity: 'sha512-' + hash(bytes, 'sha512', 'base64') });
    }
    gate('smoke.pack', 'pnpm', ['smoke.pack', '--keep', '--tarballs', tarballs]);
    writeJSON(join(directory, 'release.json'), { schema: 1, sourceCommit, createdAt: new Date().toISOString(),
        node: process.version, gates, packages });
    say(`Verified tarballs: ${directory}. Review release.json, then publish this directory explicitly.`);
};

const artifacts = () => {
    const directory = resolve(directoryArg);
    const manifest = JSON.parse(readFileSync(join(directory, 'release.json'), 'utf8'));
    const entries = verifyArtifacts(manifest, projects, head(), (file) => readFileSync(join(directory, file)))
        .map((entry) => ({ ...entry, file: join(directory, entry.file) }));
    return { manifest, entries };
};

const confirm = async (entry, required = true) => {
    const published = await registryPackage(entry.name, entry.version);
    if (!published && !required) return false;
    if (!published || published.dist?.integrity !== entry.integrity) {
        throw new Error(`${entry.name}@${entry.version}: missing or different registry tarball; do not overwrite or rebuild it.`);
    }
    if ((await registryPackage(entry.name))?.version !== entry.version) throw new Error(`${entry.name}@${entry.version} is not tagged latest.`);
    return true;
};

const publish = async () => {
    clean();
    const { manifest, entries } = artifacts();
    if (mode === '--verify-registry') {
        for (const entry of entries) await confirm(entry);
        say(`All ${entries.length} exact registry versions, integrity hashes and latest tags match.`);
        return;
    }
    const ci = JSON.parse(read('gh', ['run', 'list', '--workflow', 'ci.yml', '--commit', manifest.sourceCommit,
        '--limit', '1', '--json', 'headSha,status,conclusion']));
    if (ci[0]?.headSha !== manifest.sourceCommit || ci[0]?.status !== 'completed' || ci[0]?.conclusion !== 'success') {
        throw new Error('Green CI on the prepared source commit is required before publishing.');
    }
    // Authenticate only at the explicit publishing boundary. Never log account configuration or secrets.
    run('pnpm', ['whoami'], root, { stdio: 'ignore' });
    // Check every existing artifact before the first upload: a conflicting partial round stops early.
    const missing = [];
    for (const entry of entries) {
        if (await confirm(entry, false)) continue;
        const latest = await registryPackage(entry.name);
        if (latest && nextVersion(latest.version) !== entry.version) {
            throw new Error(`Registry advanced to ${entry.name}@${latest.version}; prepare a new coordinated release.`);
        }
        missing.push(entry);
    }
    for (const entry of missing) {
        say(`Publishing ${entry.name}@${entry.version} to latest`);
        run('pnpm', ['publish', entry.file, '--access', 'public', '--tag', 'latest', '--ignore-scripts', '--no-git-checks']);
        let visible = false;
        for (const delay of [0, 2000, 5000, 10000, 20000, 30000]) {
            if (delay) await new Promise((resolveWait) => setTimeout(resolveWait, delay));
            if (await confirm(entry, false)) { visible = true; break; }
        }
        if (!visible) throw new Error(`Registry confirmation pending for ${entry.name}; resume with the same artifacts.`);
    }
    for (const entry of entries) await confirm(entry);
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
    if (mode === '--publish') console.error('[release] Artifacts are preserved. Resume the same --publish directory after resolving the failure.');
    process.exitCode = 1;
}
