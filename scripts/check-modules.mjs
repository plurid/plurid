#!/usr/bin/env node
/**
 * Import every public package's published entry points the way a consumer does — as NATIVE Node
 * ESM (`import`) and as CommonJS (`require`) — from inside the package directory, so its peers
 * resolve through the workspace. A packaging or interop mistake (a CommonJS peer read through a
 * default import, a missing file in `files`, a broken `exports` map) throws here, where the
 * bundled browser suite and the jest suites never see it.
 *
 *   pnpm check.modules
 */
import { execFileSync } from 'node:child_process';
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');


/** The workspace's public projects, from pnpm itself (a directory outside the workspace globs is not published from here). */
const listWorkspace = () => {
    const output = execFileSync('pnpm', ['-r', 'ls', '--depth', '-1', '--json'], { cwd: root, stdio: ['ignore', 'pipe', 'ignore'], timeout: 120000 }).toString();
    const projects = JSON.parse(output);
    return projects
        .filter((project) => project.name && !project.private && !project.path.includes('/fixtures/'))
        .map((project) => ({ directory: project.path, data: JSON.parse(readFileSync(join(project.path, 'package.json'), 'utf8')) }));
};

const packages = listWorkspace();

/** The (subpath, import target, require target) triples of a package's `exports` map, or main/module. */
const entriesOf = (data) => {
    const entries = [];
    const exportsMap = data.exports;
    if (exportsMap && typeof exportsMap === 'object') {
        for (const [subpath, target] of Object.entries(exportsMap)) {
            if (typeof target === 'string') {
                entries.push({ subpath, esm: target, cjs: target });
            } else if (target && typeof target === 'object') {
                entries.push({ subpath, esm: target.import ?? target.default, cjs: target.require ?? target.default });
            }
        }
    } else {
        entries.push({ subpath: '.', esm: data.module ?? data.main, cjs: data.main });
    }
    return entries.filter((entry) => entry.esm || entry.cjs);
};

const run = (directory, mode, file) => {
    const script = mode === 'esm'
        ? `const m = await import(${JSON.stringify(file)}); if (!m || typeof m !== 'object') throw new Error('no namespace'); console.log(Object.keys(m).length);`
        : `const m = require(${JSON.stringify(file)}); if (!m || (typeof m !== 'object' && typeof m !== 'function')) throw new Error('no exports'); console.log(typeof m === 'function' ? 1 : Object.keys(m).length);`;
    const arguments_ = mode === 'esm'
        ? ['--input-type=module', '-e', script]
        : ['-e', script];
    try {
        const output = execFileSync(process.execPath, arguments_, {
            cwd: directory,
            stdio: ['ignore', 'pipe', 'pipe'],
            env: { ...process.env, NODE_ENV: 'production' },
            timeout: 60000,
        }).toString().trim();
        return { ok: true, exports: Number(output) };
    } catch (error) {
        const stderr = (error.stderr ? error.stderr.toString() : error.message).split('\n')
            .filter((line) => line.trim() && !line.includes('npm warn'))
            .slice(0, 6).join('\n      ');
        return { ok: false, error: stderr };
    }
};

let failures = 0;
for (const { directory, data } of packages) {
    for (const entry of entriesOf(data)) {
        for (const mode of ['esm', 'cjs']) {
            const target = mode === 'esm' ? entry.esm : entry.cjs;
            if (!target) {
                continue;
            }
            const file = resolve(directory, target);
            if (!existsSync(file)) {
                console.log(`  FAIL  ${data.name} ${entry.subpath} [${mode}] missing file ${target} — build first (pnpm build)`);
                failures += 1;
                continue;
            }
            const result = run(directory, mode, file);
            if (result.ok) {
                console.log(`  ok    ${data.name} ${entry.subpath} [${mode}] ${result.exports} exports`);
            } else {
                console.log(`  FAIL  ${data.name} ${entry.subpath} [${mode}]\n      ${result.error}`);
                failures += 1;
            }
        }
    }
}

if (failures > 0) {
    console.error(`\n[check.modules] ${failures} entry point(s) failed to load`);
    process.exit(1);
}
console.log(`\n[check.modules] every entry point of ${packages.length} packages loads under ESM and CommonJS`);
