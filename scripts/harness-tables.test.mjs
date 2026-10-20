import assert from 'node:assert/strict';
import { test } from 'node:test';
import { spawnSync } from 'node:child_process';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { ASSERTION_GLOBALS, expectationsText, namedGlobals, publishedGlobals, stepText, undocumentedGlobals } from './harness-tables.mjs';

const harness = fileURLToPath(new URL('../fixtures/render-test/src/', import.meta.url));
const sources = (directory) => readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return sources(path);
    return /\.tsx?$/.test(entry.name) ? [readFileSync(path, 'utf8')] : [];
});

// docs/HARNESS.md printed `undefined → undefined` for every bus step and `[object Object]` for every
// visible expectation (2026-10-20).
test('every fixture step and expectation of the harness catalog reads as text', async () => {
    const { FIXTURES } = await import(pathToFileURL(join(harness, 'fixtures', 'catalog.ts')).href);
    for (const fixture of FIXTURES) {
        for (const step of fixture.steps || []) assert.doesNotMatch(stepText(step), /undefined/, fixture.name);
        assert.doesNotMatch(expectationsText(fixture.expect), /object Object|undefined/, fixture.name);
    }
    assert.equal(stepText({ kind: 'setPlanes', view: ['/geometry'] }), 'view.setPlanes /geometry');
    assert.equal(stepText({ kind: 'spawn', plane: '/geometry', route: '/material' }), 'space.spawnPlane /geometry → /material');
    assert.equal(stepText({ kind: 'publish', topic: 'space.describe' }), 'space.describe');
    assert.equal(expectationsText({ planes: 2, visible: [{ route: '/a', minWidth: 100 }] }), 'planes: 2, visible: [/a ≥ 100 px]');
    assert.throws(() => stepText({ kind: 'teleport' }), /no text/);
});

test('the assertion globals sentence names every global the harness publishes, and only those', () => {
    const published = publishedGlobals(sources(harness));
    assert.deepEqual(undocumentedGlobals(ASSERTION_GLOBALS, published), []);
    assert.deepEqual(namedGlobals(ASSERTION_GLOBALS).filter((name) => !published.includes(name)), []);
});


test('docs.tables names the Node it needs before it imports a .ts registry (2026-10-20)', () => {
    // A Node that cannot strip types failed with ERR_UNKNOWN_FILE_EXTENSION from the harness's flags.ts.
    const script = fileURLToPath(new URL('./generate-tables.mjs', import.meta.url));
    const result = spawnSync(process.execPath, ['--no-experimental-strip-types', script, '--check'], { encoding: 'utf8' });
    assert.equal(result.status, 1);
    assert.match(result.stderr, /Node ≥ 22\.18/);
    assert.doesNotMatch(result.stderr, /ERR_UNKNOWN_FILE_EXTENSION/);
});
