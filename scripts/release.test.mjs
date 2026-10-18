import assert from 'node:assert/strict';
import { test } from 'node:test';
import { gzipSync } from 'node:zlib';
import { createHash } from 'node:crypto';
import { affectsPackage, nextVersion, packedJSON, planRelease, releaseOrder, REQUIRED_GATES, verifyArtifacts } from './release-plan.mjs';

const project = (name, dependencies = {}, extra = {}) => ({
    directory: '/repo/packages/' + name,
    data: { name, version: '0.0.0-4', dependencies, ...extra },
});
const plan = (projects, files = [], extra = {}) => planRelease({
    projects, files, root: '/repo', published: Object.fromEntries(projects.map((p) => [p.data.name, p.data.version])), ...extra,
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
