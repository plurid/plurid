import assert from 'node:assert/strict';
import { after, test } from 'node:test';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { delimiter, join } from 'node:path';
import { gzipSync } from 'node:zlib';
import { REQUIRED_GATES, rememberArtifacts } from './release-plan.mjs';
import { publishArtifacts } from './release-publish.mjs';
/** A test's temporary directory: removed after the file's tests unless PLURID_PRESERVE_ARTIFACTS=1, the repository's convention. */
const temporaryDirectories = [];
const temporaryDirectory = (prefix) => {
    const directory = mkdtempSync(join(tmpdir(), prefix));
    temporaryDirectories.push(directory);
    return directory;
};
after(() => {
    if (process.env.PLURID_PRESERVE_ARTIFACTS === '1') return;
    for (const directory of temporaryDirectories) rmSync(directory, { recursive: true, force: true });
});

/** Every executable and registry request is replaced locally. These tests cannot publish. */
const fixture = () => {
    const root = temporaryDirectory('plurid-publish-batch-');
    const commit = 'a'.repeat(40);
    const directory = join(root, 'artifacts');
    for (const path of ['scripts', 'bin', 'artifacts/tarballs']) mkdirSync(join(root, path), { recursive: true });
    writeFileSync(join(root, 'package.json'), '{"private":true}');
    for (const file of ['release.mjs', 'release-pack.mjs', 'release-plan.mjs', 'release-publish.mjs']) {
        if (existsSync(new URL(file, import.meta.url))) cpSync(new URL(file, import.meta.url), join(root, 'scripts', file));
    }
    const projects = ['a', 'b', 'c'].map((name, index) => {
        const path = join(root, 'packages', name);
        mkdirSync(path, { recursive: true });
        const data = { name, version: '0.0.0-4', ...(index ? { dependencies: { [['a', 'b'][index - 1]]: '0.0.0-4' } } : {}) };
        writeFileSync(join(path, 'package.json'), JSON.stringify(data));
        return { name, path, private: false, data };
    });
    const packages = projects.map(({ data }) => {
        const body = Buffer.from(JSON.stringify(data));
        const header = Buffer.alloc(512);
        header.write('package/package.json');
        header.write(body.length.toString(8).padStart(11, '0') + '\0', 124);
        header[156] = 48;
        const bytes = gzipSync(Buffer.concat([header, body, Buffer.alloc((512 - body.length % 512) % 512), Buffer.alloc(1024)]));
        const file = 'tarballs/' + data.name + '.tgz';
        writeFileSync(join(directory, file), bytes);
        return { name: data.name, version: data.version, file,
            sha256: createHash('sha256').update(bytes).digest('hex'),
            integrity: 'sha512-' + createHash('sha512').update(bytes).digest('base64') };
    });
    const manifest = { schema: 1, sourceCommit: commit, gates: REQUIRED_GATES, packages };
    writeFileSync(join(directory, 'release.json'), JSON.stringify(manifest));
    writeFileSync(join(root, 'projects.json'), JSON.stringify(projects));
    writeFileSync(join(root, 'uploads.json'), '[]');
    rememberArtifacts(root, commit, directory);
    let scenario = { head: commit, visible: 'after-uploads', existing: [], files: [] };
    const configure = (patch) => {
        scenario = { ...scenario, ...patch };
        writeFileSync(join(root, 'scenario.json'), JSON.stringify(scenario));
    };
    configure({});
    const shim = `#!${process.execPath}
const fs = require('node:fs');
const path = require('node:path');
const root = process.env.PLURID_PUBLISH_TEST_ROOT;
const name = path.basename(process.argv[1]);
const args = process.argv.slice(2);
const scenario = JSON.parse(fs.readFileSync(path.join(root, 'scenario.json'), 'utf8'));
fs.appendFileSync(path.join(root, 'calls.jsonl'), JSON.stringify({ name, args }) + '\\n');
if (name === 'git') {
    if (args[0] === 'status' || args[0] === 'merge-base') process.exit(0);
    if (args[0] === 'rev-parse') { console.log(scenario.head); process.exit(0); }
    if (args[0] === 'diff') { process.stdout.write(scenario.files.join('\\0') + (scenario.files.length ? '\\0' : '')); process.exit(0); }
    if (args[0] === 'tag') process.exit(0);
    if (args[0] === 'archive') { console.error('Unexpected rebuild'); process.exit(7); }
}
if (name === 'gh') { console.log(JSON.stringify([{ headSha: scenario.head, status: 'completed', conclusion: 'success' }])); process.exit(0); }
if (name === 'pnpm' && args[0] === '-r') { console.log(fs.readFileSync(path.join(root, 'projects.json'), 'utf8')); process.exit(0); }
if (name === 'pnpm' && args[0] === 'whoami') process.exit(0);
if (name === 'pnpm' && args[0] === 'publish') {
    const packageName = path.basename(args[1], '.tgz');
    // npm refused the upload (a one-time password, a permission): nothing reached the registry.
    if (scenario.rejectAt === packageName) { console.error('npm ERR! code EOTP'); process.exit(1); }
    const uploads = JSON.parse(fs.readFileSync(path.join(root, 'uploads.json'), 'utf8'));
    uploads.push(packageName);
    fs.writeFileSync(path.join(root, 'uploads.json'), JSON.stringify(uploads));
    // A lost response after npm accepts the upload must not cause a duplicate on retry.
    process.exit(scenario.failAt === packageName ? 1 : 0);
}
console.error('Unexpected offline tool: ' + name + ' ' + args.join(' '));
process.exit(55);
`;
    for (const name of ['pnpm', 'npm', 'git', 'gh']) writeFileSync(join(root, 'bin', name), shim, { mode: 0o755 });
    const offline = `
import fs from 'node:fs';
import path from 'node:path';
const root = process.env.PLURID_PUBLISH_TEST_ROOT;
const scenario = JSON.parse(fs.readFileSync(path.join(root, 'scenario.json'), 'utf8'));
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'artifacts', 'release.json'), 'utf8'));
let clock = 0;
Date.now = () => clock;
globalThis.setTimeout = (callback, delay, ...args) => {
    clock += delay;
    fs.appendFileSync(path.join(root, 'calls.jsonl'), JSON.stringify({ name: 'sleep', args: [delay] }) + '\\n');
    queueMicrotask(() => callback(...args));
    return { unref() {} };
};
globalThis.fetch = async (url) => {
    const [name, requested] = new URL(url).pathname.slice(1).split('/').map(decodeURIComponent);
    const entry = manifest.packages.find(entry => entry.name === name);
    if (!entry) throw new Error('Unexpected offline registry request');
    const uploads = JSON.parse(fs.readFileSync(path.join(root, 'uploads.json'), 'utf8'));
    const existing = scenario.existing.includes(name);
    // 'uploaded': each accepted upload becomes visible on its own, as npm shows it after its scan
    const ready = scenario.visible === 'always' || (scenario.visible === 'after-uploads'
        && manifest.packages.every(entry => uploads.includes(entry.name) || scenario.existing.includes(entry.name)) && clock >= 10000)
        || (scenario.visible === 'uploaded' && uploads.includes(name) && clock >= 10000);
    const present = existing || ready;
    let data;
    if (requested === 'latest') data = { name, version: name === 'a' && scenario.advanceAfter && clock >= scenario.advanceAfter
        ? '0.0.0-5' : present && clock >= (scenario.tagDelays?.[name] ?? scenario.tagDelay ?? 0) ? entry.version : '0.0.0-3' };
    else if (present && !scenario.exactHidden?.includes(name)) data = { name, version: entry.version, dist: { integrity: scenario.mismatch === name ? 'different' : entry.integrity } };
    return new Response(JSON.stringify(data || {}), { status: data ? 200 : 404 });
};
`;
    writeFileSync(join(root, 'offline.mjs'), offline);
    const calls = () => readFileSync(join(root, 'calls.jsonl'), 'utf8').trim().split('\n').map(JSON.parse);
    const run = (args = ['--publish']) => spawnSync(process.execPath, ['--import', join(root, 'offline.mjs'), join(root, 'scripts/release.mjs'), ...args], {
        cwd: root, encoding: 'utf8', timeout: 20000,
        // the release's automatic artifact directory goes in the fixture, not the system's temporary one
        env: { ...process.env, PATH: join(root, 'bin') + delimiter + process.env.PATH, TMPDIR: root, TEMP: root, TMP: root, PLURID_PUBLISH_TEST_ROOT: root },
    });
    const uploads = () => calls().filter(({ name, args }) => name === 'pnpm' && args[0] === 'publish');
    return { root, commit, directory, configure, run, calls, uploads };
};

test('all tarballs upload in dependency order before the shared npm availability wait', () => {
    const f = fixture();
    const result = f.run();
    assert.equal(result.status, 0, result.stderr);
    assert.deepEqual(f.uploads().map(({ args }) => args[1].split('/').pop()), ['a.tgz', 'b.tgz', 'c.tgz']);
    const calls = f.calls();
    const firstWait = calls.findIndex(({ name }) => name === 'sleep');
    const lastUpload = calls.findLastIndex(({ name, args }) => name === 'pnpm' && args[0] === 'publish');
    assert.ok(firstWait > lastUpload, 'availability waits must not consume the five-minute authentication window');
    assert.equal(calls.filter(({ name, args }) => name === 'pnpm' && args[0] === 'whoami').length, 1);
    for (const { args } of f.uploads()) assert.ok(args.includes('--ignore-scripts'));
});

test('a timeout covers the whole release; retries never resubmit accepted but invisible uploads or authenticate again', () => {
    const f = fixture();
    f.configure({ visible: 'never' });
    const args = ['--publish', '--wait', '30'];
    const first = f.run(args);
    assert.equal(first.status, 1, first.stderr);
    assert.match(first.stderr, /npm availability pending/);
    assert.equal(f.uploads().length, 3);
    assert.equal(f.calls().filter(({ name }) => name === 'sleep').reduce((sum, { args }) => sum + args[0], 0), 30000);
    const second = f.run(['--publish', '--wait', '0']);
    assert.equal(second.status, 1, second.stderr);
    assert.equal(f.uploads().length, 3);
    assert.equal(f.calls().filter(({ name, args }) => name === 'pnpm' && args[0] === 'whoami').length, 1);
    f.configure({ visible: 'always' });
    const third = f.run();
    assert.equal(third.status, 0, third.stderr);
    assert.equal(f.uploads().length, 3);
    assert.equal(f.calls().filter(({ name, args }) => name === 'pnpm' && args[0] === 'whoami').length, 1);
});

test('a lost CLI response after an accepted upload never duplicates it on resume', () => {
    const f = fixture();
    // npm shows the accepted upload: its dependents follow once it is there
    f.configure({ failAt: 'b', visible: 'uploaded' });
    const first = f.run();
    assert.equal(first.status, 1);
    assert.equal(f.uploads().length, 2);
    f.configure({ failAt: null });
    const second = f.run();
    assert.equal(second.status, 0, second.stderr);
    assert.deepEqual(f.uploads().map(({ args }) => args[1].split('/').pop()), ['a.tgz', 'b.tgz', 'c.tgz']);
});

test('a rejected upload holds back its dependents, and its receipt is named to move aside', () => {
    // The receipt of an upload npm refused marks it as submitted, so a rerun skipped it, and uploaded
    // the packages after it to latest: they pinned a version that never arrived (2026-10-20).
    const f = fixture();
    f.configure({ rejectAt: 'b', visible: 'uploaded' });
    const first = f.run();
    assert.equal(first.status, 1);
    assert.match(first.stderr, /EOTP/);
    f.configure({ rejectAt: null });
    const second = f.run(['--publish', '--wait', '0']);
    assert.equal(second.status, 1, second.stderr);
    assert.deepEqual(f.uploads().map(({ args }) => args[1].split('/').pop()), ['a.tgz', 'b.tgz']);
    assert.match(second.stderr, /move its receipt aside/);
    assert.match(second.stderr, /publication\/b@0\.0\.0-4\.jsonl/);
});

test('registry integrity conflicts stop before authentication or any upload', () => {
    const f = fixture();
    f.configure({ existing: ['a'], mismatch: 'a' });
    const result = f.run();
    assert.equal(result.status, 1);
    assert.match(result.stderr, /different registry tarball/);
    assert.equal(f.uploads().length, 0);
    assert.equal(f.calls().some(({ name, args }) => name === 'pnpm' && args[0] === 'whoami'), false);
});

test('a visible version with a lagging latest tag is checked again without re-uploading it', () => {
    const f = fixture();
    f.configure({ existing: ['a'], tagDelay: 20000 });
    const result = f.run();
    assert.equal(result.status, 0, result.stderr);
    assert.deepEqual(f.uploads().map(({ args }) => args[1].split('/').pop()), ['b.tgz', 'c.tgz']);
});

test('publisher-only fixes reuse the existing verified tarballs and tag their tested source commit', () => {
    const f = fixture();
    f.configure({ head: 'b'.repeat(40), files: ['scripts/release-publish.mjs', 'scripts/release-publish.test.mjs', 'docs/RELEASING.md'] });
    const result = f.run();
    assert.equal(result.status, 0, result.stderr);
    assert.equal(f.uploads().length, 3);
    assert.equal(f.calls().some(({ name, args }) => name === 'git' && args[0] === 'archive'), false);
    const tag = f.calls().find(({ name, args }) => name === 'git' && args[0] === 'tag' && args[1] === '-a');
    assert.ok(tag.args.includes(f.commit));
    assert.equal(tag.args.includes('b'.repeat(40)), false);
});

test('a runtime change cannot reuse stale artifacts even with an explicit directory', () => {
    const f = fixture();
    f.configure({ head: 'b'.repeat(40), files: ['packages/a/source/index.ts'] });
    const result = f.run(['--publish', f.directory]);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /build or runtime inputs/);
    assert.equal(f.uploads().length, 0);
    assert.equal(f.calls().some(({ name, args }) => name === 'pnpm' && args[0] === 'whoami'), false);
});

test('a change to how artifacts are built and verified cannot reuse them (2026-10-22)', () => {
    const f = fixture();
    f.configure({ head: 'b'.repeat(40), files: ['scripts/release-pack.mjs'] });
    const result = f.run(['--publish', f.directory]);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /build or runtime inputs/);
    assert.equal(f.uploads().length, 0);
});

test('public registry verification does not authenticate, upload, or create a release tag', () => {
    const f = fixture();
    f.configure({ visible: 'always' });
    const result = f.run(['--verify-registry', '--wait', '0']);
    assert.equal(result.status, 0, result.stderr);
    assert.equal(f.uploads().length, 0);
    assert.equal(f.calls().some(({ name, args }) => name === 'pnpm' && args[0] === 'whoami'), false);
    assert.equal(f.calls().some(({ name, args }) => name === 'git' && args[0] === 'tag'), false);
});

test('upload receipts are bound to these exact artifacts before a resumed release can authenticate', () => {
    const f = fixture();
    f.configure({ visible: 'never' });
    assert.equal(f.run(['--publish', '--wait', '0']).status, 1);
    const receipt = join(f.directory, 'publication', 'a@0.0.0-4.jsonl');
    const lines = readFileSync(receipt, 'utf8').trimEnd().split('\n').map(JSON.parse);
    lines[0].integrity = 'changed';
    writeFileSync(receipt, lines.map((record) => JSON.stringify(record)).join('\n') + '\n');
    const result = f.run(['--publish', '--wait', '0']);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /Invalid upload receipt/);
    assert.equal(f.uploads().length, 3);
    assert.equal(f.calls().filter(({ name, args }) => name === 'pnpm' && args[0] === 'whoami').length, 1);
});

test('concurrent publishers cannot claim the same tarball twice', async () => {
    const f = fixture();
    const manifest = JSON.parse(readFileSync(join(f.directory, 'release.json'), 'utf8'));
    const entry = manifest.packages[0];
    const uploads = [];
    const options = { directory: f.directory, manifest, entries: [entry], timeoutMs: 0,
        lookup: async (name, version) => uploads.length
            ? { name, version: entry.version, dist: { integrity: entry.integrity } }
            : version ? null : { name, version: '0.0.0-3' },
        authenticate: () => {}, upload: () => { uploads.push(entry.name); },
    };
    const results = await Promise.allSettled([publishArtifacts(options), publishArtifacts(options)]);
    assert.equal(uploads.length, 1);
    assert.equal(results.filter(({ status }) => status === 'fulfilled').length, 1);
    assert.equal(results.find(({ status }) => status === 'rejected').reason.code, 'EEXIST');
});

test('a latest tag already naming the target prevents re-upload while the exact-version endpoint lags', () => {
    const f = fixture();
    f.configure({ visible: 'always', exactHidden: ['a'] });
    const result = f.run(['--publish', '--wait', '0']);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /npm availability pending/);
    assert.equal(f.uploads().length, 0);
    assert.equal(f.calls().some(({ name, args }) => name === 'pnpm' && args[0] === 'whoami'), false);
    // Even if both endpoints are stale on a later retry, retain the registry's earlier evidence.
    f.configure({ visible: 'never' });
    assert.equal(f.run(['--publish', '--wait', '0']).status, 1);
    assert.equal(f.uploads().length, 0);
});

test('the complete release must still match when its slowest package becomes available', () => {
    const f = fixture();
    f.configure({ tagDelays: { c: 20000 }, advanceAfter: 15000 });
    const result = f.run();
    assert.equal(result.status, 1, result.stderr);
    assert.match(result.stderr, /Registry advanced to a@0.0.0-5/);
    assert.equal(f.uploads().length, 3);
});
