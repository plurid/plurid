import './release-publish.test.mjs';
import './harness-tables.test.mjs';
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { gzipSync } from 'node:zlib';
import { createHash } from 'node:crypto';
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, realpathSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { delimiter, join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { affectsPackage, nextVersion, packedJSON, planRelease, releaseOrder, REQUIRED_GATES, verifyArtifacts, parseReleaseArguments, createArtifactDirectory, rememberedArtifacts, rememberArtifacts } from './release-plan.mjs';

const project = (name, dependencies = {}, extra = {}) => ({
    directory: '/repo/packages/' + name,
    data: { name, version: '0.0.0-4', dependencies, ...extra },
});
const plan = (projects, files = [], extra = {}) => planRelease({
    projects, files, root: '/repo', published: Object.fromEntries(projects.map((p) => [p.data.name, p.data.version])), ...extra,
});

test('the verify gate runs each browser project alone, as CI and release --pack do (2026-10-20)', () => {
    // `pnpm --filter plurid-render-test e2e` ran chromium, perf and visual in one Playwright invocation,
    // so the frame budgets were measured beside 160 other tests.
    const { scripts } = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
    const expand = (command) => command.split('&&').map((part) => part.trim())
        .flatMap((part) => /^pnpm [\w.:]+$/.test(part) && scripts[part.slice(5)] ? expand(scripts[part.slice(5)]) : [part]);
    const browser = expand(scripts.verify).filter((part) => /plurid-render-test (e2e|exec playwright)/.test(part));
    assert.ok(browser.length > 0);
    for (const part of browser) assert.match(part, /--project=\w+/, part);
    assert.deepEqual(browser.map((part) => part.match(/--project=(\w+)/)[1]), ['chromium', 'perf', 'visual']);
});

test('shipped manifests, assets and build inputs count; tests and retained outputs do not', () => {
    for (const file of ['package.json', 'tsup.config.ts', 'source/index.ts', 'templates/kit/index.ts', 'binder/start', 'configurations/tsconfig.types.json']) {
        assert.equal(affectsPackage('packages/a/' + file, 'packages/a'), true, file);
    }
    for (const file of ['source/__tests__/index.ts', 'source/index.test.ts', 'distribution/index.js', 'configurations/jest.config.js']) {
        assert.equal(affectsPackage('packages/a/' + file, 'packages/a'), false, file);
    }
    assert.equal(affectsPackage('scripts/tsup/cjs-interop.mjs', 'packages/a'), true);
    assert.equal(affectsPackage('packages/ab/source/index.ts', 'packages/a'), false);
});

test('manifest-only changes release a package', () => {
    assert.equal(plan([project('a')], ['packages/a/package.json'])[0].target, '0.0.0-5');
});

test('a released dependency propagates through runtime and peer dependents', () => {
    const result = plan([project('a'), project('b', { a: 'workspace:^' }), project('c', {}, { peerDependencies: { b: '>=0.0.0-4' } })], ['packages/a/source/index.ts']);
    assert.deepEqual(result.map((p) => p.target), ['0.0.0-5', '0.0.0-5', '0.0.0-5']);
});

test('the generator follows the versions baked into its output', () => {
    const result = plan([project('@plurid/plurid-kit'), project('@plurid/generate-plurid-app')], [], { all: true });
    assert.equal(result[1].target, '0.0.0-5');
    const followed = plan([project('@plurid/plurid-kit'), project('@plurid/generate-plurid-app')], ['packages/@plurid/plurid-kit/source/index.ts']);
    assert.equal(followed[1].target, '0.0.0-5');
});

test('preparation is idempotent while the next alpha is unpublished', () => {
    const result = plan([project('a', {}, { version: '0.0.0-5' })], ['packages/a/source/index.ts'], { published: { a: '0.0.0-4' }, all: true });
    assert.equal(result[0].target, '0.0.0-5');
});

test('registry drift refuses an accidental downgrade', () => {
    assert.throws(() => plan([project('a')], [], { published: { a: '0.0.0-5' } }), /must equal registry/);
});

test('test-only changes need no release; --no-bump keeps exact prepared versions', () => {
    assert.equal(plan([project('a')], ['packages/a/source/__tests__/x.ts'])[0].target, '0.0.0-4');
    assert.equal(plan([project('a')], [], { all: true, noBump: true })[0].target, '0.0.0-4');
});

test('alpha arithmetic is exact and rejects stable versions', () => {
    assert.equal(nextVersion('0.0.0-9007199254740993'), '0.0.0-9007199254740994');
    assert.throws(() => nextVersion('1.0.0'), /alpha version/);
});

test('release ordering includes runtime dependencies, peer dependencies and generator pins', () => {
    const entries = [project('@plurid/generate-plurid-app'), project('@plurid/plurid-kit', {}, { peerDependencies: { b: '>=0.0.0-4' } }), project('b', { a: 'workspace:^' }), project('a')];
    assert.deepEqual(releaseOrder(entries).map((p) => p.data.name), ['a', 'b', '@plurid/plurid-kit', '@plurid/generate-plurid-app']);
    assert.throws(() => releaseOrder([project('a', { b: '*' }), project('b', { a: '*' })]), /Cyclic/);
});

test('tarball inspection reads the actual packed manifest and rejects malformed archives', () => {
    const body = Buffer.from(JSON.stringify({ name: 'a', version: '0.0.0-5' }));
    const header = Buffer.alloc(512);
    header.write('package/package.json');
    header.write(body.length.toString(8).padStart(11, '0') + '\0', 124);
    header[156] = 48;
    const archive = gzipSync(Buffer.concat([header, body, Buffer.alloc(512 - body.length), Buffer.alloc(1024)]));
    assert.deepEqual(packedJSON(archive), { name: 'a', version: '0.0.0-5' });
    assert.throws(() => packedJSON(archive, 'package/missing.json'), /missing/);
    header.write('77777777777\0', 124);
    assert.throws(() => packedJSON(gzipSync(Buffer.concat([header, body]))), /Invalid/);
});


test('publication refuses tampered artifacts, incomplete graphs, failed gates and stale source', () => {
    const body = Buffer.from(JSON.stringify({ name: 'a', version: '0.0.0-4' }));
    const header = Buffer.alloc(512);
    header.write('package/package.json');
    header.write(body.length.toString(8).padStart(11, '0') + '\0', 124);
    header[156] = 48;
    const bytes = gzipSync(Buffer.concat([header, body, Buffer.alloc(512 - body.length), Buffer.alloc(1024)]));
    const manifest = { schema: 1, sourceCommit: 'abc', gates: REQUIRED_GATES, packages: [{
        name: 'a', version: '0.0.0-4', file: 'tarballs/a.tgz',
        sha256: createHash('sha256').update(bytes).digest('hex'),
        integrity: 'sha512-' + createHash('sha512').update(bytes).digest('base64'),
    }] };
    const verify = (input = manifest, commit = 'abc') => verifyArtifacts(input, [project('a')], commit, () => bytes);
    assert.equal(verify()[0].name, 'a');
    assert.throws(() => verify(manifest, 'other'), /source commit/);
    assert.throws(() => verify({ ...manifest, gates: ['build'] }), /required gates/);
    assert.throws(() => verify({ ...manifest, packages: [] }), /complete public workspace/);
    assert.throws(() => verify({ ...manifest, packages: [{ ...manifest.packages[0], sha256: 'changed' }] }), /Artifact mismatch/);
    assert.throws(() => verify({ ...manifest, packages: [{ ...manifest.packages[0], file: '../a.tgz' }] }), /artifact path/);
});


test('release commands manage paths by default while preserving explicit directory support', () => {
    assert.deepEqual(parseReleaseArguments([]), { mode: '--dry-run', directory: undefined, all: false, noBump: false, waitSeconds: 1200 });
    for (const mode of ['--pack', '--publish', '--verify-registry']) {
        assert.equal(parseReleaseArguments([mode]).directory, undefined);
        assert.equal(parseReleaseArguments([mode, '/tmp/release with spaces']).directory, '/tmp/release with spaces');
    }
    assert.throws(() => parseReleaseArguments(['--pack', '--publish']), /one release phase/);
    assert.throws(() => parseReleaseArguments(['--pack', '--all']), /only to planning/);
    assert.throws(() => parseReleaseArguments(['--publish', 'one', 'two']), /Unknown argument/);
});

test('automatic artifact directories are unique, retained, and remembered per exact commit', () => {
    const root = mkdtempSync(join(tmpdir(), 'plurid-release-artifacts-'));
    const commit = 'a'.repeat(40);
    assert.equal(rememberedArtifacts(root, commit), null);
    const first = createArtifactDirectory(root, commit);
    const second = createArtifactDirectory(root, commit);
    assert.notEqual(first, second);
    assert.equal(first.startsWith(root + '/'), false, 'fresh source must not inherit checkout node_modules');
    assert.equal(existsSync(first), true);
    assert.equal(rememberedArtifacts(root, commit), null);
    writeFileSync(join(first, 'release.json'), JSON.stringify({ sourceCommit: commit }));
    rememberArtifacts(root, commit, first);
    assert.equal(rememberedArtifacts(root, commit), first);
    assert.equal(rememberedArtifacts(root, 'b'.repeat(40)), null);
    // A failed new build cannot displace the previous verified/partially published round.
    assert.throws(() => rememberArtifacts(root, commit, second), /ENOENT/);
    assert.equal(rememberedArtifacts(root, commit), first);
    const explicit = createArtifactDirectory(root, commit, 'chosen output');
    writeFileSync(join(explicit, 'keep.txt'), 'keep');
    assert.throws(() => createArtifactDirectory(root, commit, 'chosen output'), /preserving/);
    assert.equal(readFileSync(join(explicit, 'keep.txt'), 'utf8'), 'keep');
});

test('stale or missing recorded artifacts stop rather than silently rebuilding a partial round', () => {
    const root = mkdtempSync(join(tmpdir(), 'plurid-release-record-'));
    const commit = 'a'.repeat(40);
    const directory = createArtifactDirectory(root, commit);
    writeFileSync(join(directory, 'release.json'), JSON.stringify({ sourceCommit: 'b'.repeat(40) }));
    assert.throws(() => rememberArtifacts(root, commit, directory), /another commit/);
    const pointer = join(root, '.out', 'releases', commit + '.json');
    writeFileSync(pointer, JSON.stringify({ sourceCommit: commit, directory: join(root, 'missing') }));
    assert.throws(() => rememberedArtifacts(root, commit), /artifacts are missing/);
    writeFileSync(pointer, JSON.stringify({ sourceCommit: 'b'.repeat(40), directory }));
    assert.throws(() => rememberedArtifacts(root, commit), /Invalid release artifact record/);
});

/** Exercise the actual CLI with offline tool shims; publication and network access are impossible. */
const releaseCLIFixture = (ci = 'success') => {
    const root = mkdtempSync(join(tmpdir(), 'plurid-release-cli-'));
    const commit = 'a'.repeat(40);
    mkdirSync(join(root, 'scripts'));
    mkdirSync(join(root, 'bin'));
    mkdirSync(join(root, 'project'));
    writeFileSync(join(root, 'package.json'), JSON.stringify({ private: true, type: 'commonjs' }));
    writeFileSync(join(root, 'project', 'package.json'), JSON.stringify({ name: 'a', version: '0.0.0-4' }));
    for (const file of ['release.mjs', 'release-plan.mjs', 'release-publish.mjs']) {
        if (existsSync(new URL(file, import.meta.url))) cpSync(new URL(file, import.meta.url), join(root, 'scripts', file));
    }
    const shim = `#!${process.execPath}
const fs = require('node:fs');
const path = require('node:path');
const root = process.env.PLURID_RELEASE_TEST_ROOT;
const name = path.basename(process.argv[1]);
const args = process.argv.slice(2);
fs.appendFileSync(path.join(root, 'calls.jsonl'), JSON.stringify({ name, args, server: process.env.PLURID_E2E_OWN_SERVER }) + '\\n');
if (name === 'git' && args[0] === 'status') process.exit(0);
if (name === 'git' && args[0] === 'rev-parse') { console.log('${commit}'); process.exit(0); }
if (name === 'git' && args[0] === 'archive') { console.error('test build boundary'); process.exit(7); }
if (name === 'gh') {
    console.log(JSON.stringify([{ headSha: '${commit}', status: 'completed', conclusion: process.env.PLURID_RELEASE_TEST_CI }]));
    process.exit(0);
}
if (name === 'pnpm' && args[0] === '-r') {
    console.log(JSON.stringify([{ name: 'a', private: false, path: path.join(root, 'project') }]));
    process.exit(0);
}
if (name === 'pnpm' && args[0] === 'whoami') process.exit(19);
console.error('Unexpected test tool call: ' + name + ' ' + args.join(' '));
process.exit(55);
`;
    for (const name of ['pnpm', 'git', 'gh']) writeFileSync(join(root, 'bin', name), shim, { mode: 0o755 });
    writeFileSync(join(root, 'offline.mjs'), "globalThis.fetch = async () => { throw new Error('Network disabled in release CLI tests'); };\n");
    return {
        root, commit,
        run: () => spawnSync(process.execPath, ['--import', join(root, 'offline.mjs'), join(root, 'scripts', 'release.mjs'), '--publish'], {
            cwd: root, encoding: 'utf8', timeout: 10000,
            env: { ...process.env, PATH: join(root, 'bin') + delimiter + process.env.PATH,
                PLURID_RELEASE_TEST_ROOT: root, PLURID_RELEASE_TEST_CI: ci },
        }),
        calls: () => readFileSync(join(root, 'calls.jsonl'), 'utf8').trim().split('\n').map((line) => JSON.parse(line)),
    };
};

test('bare --publish refuses failed CI before creating artifacts or authenticating', () => {
    const fixture = releaseCLIFixture('failure');
    const result = fixture.run();
    assert.equal(result.status, 1, result.stderr);
    assert.match(result.stderr, /Green CI/);
    assert.equal(existsSync(join(fixture.root, '.out')), false);
    assert.equal(fixture.calls().some(({ args }) => args[0] === 'whoami' || args[0] === 'archive' || args[0] === 'publish'), false);
});

test('bare --publish builds automatically when this commit has no verified artifacts', () => {
    const fixture = releaseCLIFixture();
    const result = fixture.run();
    assert.equal(result.status, 1, result.stderr);
    assert.match(result.stdout, /building and verifying before publication/);
    assert.equal(fixture.calls().some(({ name, args }) => name === 'git' && args[0] === 'archive'), true);
    assert.equal(fixture.calls().some(({ args }) => args[0] === 'whoami' || args[0] === 'publish'), false);
    assert.equal(rememberedArtifacts(fixture.root, fixture.commit), null);
});

test('a release\'s browser gates start their own harness server, never a development one already running', async () => {
    // The gates run in the archived release tree, but Playwright reused any server on the harness's
    // port: a `pnpm dev` from the checkout was what the release's browser gates tested (2026-10-20).
    const fixture = releaseCLIFixture();
    fixture.run();
    const archive = fixture.calls().find(({ name, args }) => name === 'git' && args[0] === 'archive');
    assert.equal(archive?.server, '1', 'every command a release runs carries the switch');
    const configuration = new URL('../fixtures/render-test/e2e/playwright.config.ts', import.meta.url);
    let load = 0;
    const reuses = async (environment) => {
        const saved = Object.fromEntries(Object.keys(environment).map((key) => [key, process.env[key]]));
        const apply = (values) => {
            for (const [key, value] of Object.entries(values)) {
                if (value === undefined) delete process.env[key];
                else process.env[key] = value;
            }
        };
        apply(environment);
        try {
            return (await import(configuration.href + '?load=' + ++load)).default.webServer.reuseExistingServer;
        } finally {
            apply(saved);
        }
    };
    assert.equal(await reuses({ CI: undefined, PLURID_E2E_OWN_SERVER: undefined }), true, 'a developer keeps pnpm dev');
    assert.equal(await reuses({ CI: undefined, PLURID_E2E_OWN_SERVER: '1' }), false, 'a release starts its own');
});

test('bare --publish reuses remembered verified tarballs and never rebuilds on retry', () => {
    const fixture = releaseCLIFixture();
    const directory = createArtifactDirectory(fixture.root, fixture.commit);
    const body = Buffer.from(JSON.stringify({ name: 'a', version: '0.0.0-4' }));
    const header = Buffer.alloc(512);
    header.write('package/package.json');
    header.write(body.length.toString(8).padStart(11, '0') + '\0', 124);
    header[156] = 48;
    const bytes = gzipSync(Buffer.concat([header, body, Buffer.alloc(512 - body.length), Buffer.alloc(1024)]));
    mkdirSync(join(directory, 'tarballs'));
    writeFileSync(join(directory, 'tarballs', 'a.tgz'), bytes);
    writeFileSync(join(directory, 'release.json'), JSON.stringify({
        schema: 1, sourceCommit: fixture.commit, gates: REQUIRED_GATES, packages: [{
            name: 'a', version: '0.0.0-4', file: 'tarballs/a.tgz',
            sha256: createHash('sha256').update(bytes).digest('hex'),
            integrity: 'sha512-' + createHash('sha512').update(bytes).digest('base64'),
        }],
    }));
    rememberArtifacts(fixture.root, fixture.commit, directory);
    const result = fixture.run();
    assert.equal(result.status, 1, result.stderr);
    assert.equal(fixture.calls().some(({ args }) => args[0] === 'archive'), false);
    assert.match(result.stderr, /Network disabled/);
    assert.equal(fixture.calls().filter(({ args }) => args[0] === 'whoami').length, 0);
    assert.equal(fixture.calls().some(({ args }) => args[0] === 'publish'), false);
    assert.equal(rememberedArtifacts(fixture.root, fixture.commit), directory);
});


test('themes test discovery stays inside library source in an isolated release', () => {
    const directory = realpathSync(mkdtempSync(join(tmpdir(), 'plurid-release-discovery-')));
    // The release workspace's parent is named source, which also matches Jest's CLI path filter.
    const root = join(directory, 'source', 'themes');
    const library = join(root, 'source', 'library.test.ts');
    const demo = join(root, 'fixtures', 'themes-react', 'src', 'App.test.tsx');
    mkdirSync(join(root, 'source'), { recursive: true });
    mkdirSync(join(root, 'fixtures', 'themes-react', 'src'), { recursive: true });
    writeFileSync(library, '');
    writeFileSync(demo, '');
    const project = fileURLToPath(new URL('../packages/plurid-utilities/plurid-themes/', import.meta.url));
    const require = createRequire(join(project, 'package.json'));
    const result = spawnSync(process.execPath, [require.resolve('jest/bin/jest'),
        '--config', join(project, 'configurations', 'jest.config.js'), '--rootDir', root,
        'source', '--listTests', '--json', '--runInBand', '--no-cache', '--watchman=false',
        // Discovery needs no TypeScript transform or dependencies in the retained fixture.
        '--transform', '{}',
    ], { cwd: project, encoding: 'utf8', timeout: 10000 });
    assert.equal(result.status, 0, result.stderr);
    assert.deepEqual(JSON.parse(result.stdout), [library]);
});


test('npm availability has one bounded release-wide timeout and no timeout on preparation', () => {
    assert.equal(parseReleaseArguments(['--publish']).waitSeconds, 1200);
    assert.equal(parseReleaseArguments(['--publish', '--wait', '0']).waitSeconds, 0);
    assert.equal(parseReleaseArguments(['--verify-registry', '--wait', '60']).waitSeconds, 60);
    for (const value of ['', '-1', '1.5', 'Infinity', '86401']) {
        assert.throws(() => parseReleaseArguments(['--publish', '--wait', value]), /whole number/);
    }
    assert.throws(() => parseReleaseArguments(['--prepare', '--wait', '1']), /only to publication/);
});
