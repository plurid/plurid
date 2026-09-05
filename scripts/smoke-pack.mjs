#!/usr/bin/env node
/**
 * The consumer's path, end to end: `pnpm pack` every public package, install the tarballs plus
 * their peers into a throwaway `"type": "module"` project with npm, and import every entry point
 * as native ESM and as CommonJS. Catches what a workspace never can — a file missing from `files`,
 * a `workspace:` range that did not get rewritten, a peer range the published siblings do not
 * satisfy, an interop that only worked through the symlinked node_modules.
 *
 *   pnpm smoke.pack            (needs the packages built)
 *   pnpm smoke.pack --keep     keep the temporary project for inspection
 */
import { execFileSync, execSync } from 'node:child_process';
import { readFileSync, existsSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');
const keep = process.argv.includes('--keep');


/** Peers the packages declare that live outside this repository (installed from the registry). */
const EXTERNAL_PEERS = [
    'react@19', 'react-dom@19', 'styled-components@6', '@reduxjs/toolkit@2', 'react-redux@9', 'redux@5',
    'react-helmet-async@3', 'cross-fetch@4', 'express@4', 'body-parser@1',
    '@plurid/elementql@0.0.0-1', '@plurid/elementql-client-react@0.0.0-1', '@plurid/deon@0.0.0-10',
];

/** The workspace's public projects, from pnpm itself (a directory outside the workspace globs is not published from here). */
const listWorkspace = () => {
    const output = execFileSync('pnpm', ['-r', 'ls', '--depth', '-1', '--json'], { cwd: root, stdio: ['ignore', 'pipe', 'ignore'], timeout: 120000 }).toString();
    const projects = JSON.parse(output);
    return projects
        .filter((project) => project.name && !project.private && !project.path.includes('/fixtures/'))
        .map((project) => ({ directory: project.path, data: JSON.parse(readFileSync(join(project.path, 'package.json'), 'utf8')) }));
};

const packages = listWorkspace();

const work = mkdtempSync(join(tmpdir(), 'plurid-smoke-'));
const tarballs = join(work, 'tarballs');
const project = join(work, 'project');
execSync(`mkdir -p ${JSON.stringify(tarballs)} ${JSON.stringify(project)}`);
console.log('[smoke.pack] packing ' + packages.length + ' packages into ' + tarballs);

const tarballFiles = [];
for (const { directory, data } of packages) {
    const output = execFileSync('pnpm', ['pack', '--pack-destination', tarballs], { cwd: directory, stdio: ['ignore', 'pipe', 'pipe'] }).toString().trim();
    const file = output.split('\n').pop().trim();
    const path = file.startsWith('/') ? file : join(tarballs, file);
    if (!existsSync(path)) {
        throw new Error('[smoke.pack] cannot find the tarball for ' + data.name + ': ' + output);
    }
    tarballFiles.push(path);
    // a `workspace:` range that survived packing would never install for a consumer
    const packed = execFileSync('tar', ['-xOf', path, 'package/package.json']).toString();
    if (packed.includes('workspace:')) {
        throw new Error('[smoke.pack] ' + data.name + ' packed with a workspace: range left in its manifest');
    }
}

writeFileSync(join(project, 'package.json'), JSON.stringify({ name: 'plurid-smoke', private: true, type: 'module' }, null, 2));
console.log('[smoke.pack] installing tarballs + peers with npm (a minute)');
execFileSync('npm', ['install', '--no-audit', '--no-fund', '--loglevel=error', '--strict-peer-deps', ...tarballFiles, ...EXTERNAL_PEERS], {
    cwd: project,
    stdio: ['ignore', 'pipe', 'pipe'],
    timeout: 600000,
});

const entriesOf = (data) => {
    const entries = [];
    const exportsMap = data.exports;
    if (exportsMap && typeof exportsMap === 'object') {
        for (const [subpath, target] of Object.entries(exportsMap)) {
            if (typeof target === 'string') {
                entries.push({ subpath, esm: true, cjs: true });
            } else if (target && typeof target === 'object') {
                entries.push({ subpath, esm: !!(target.import ?? target.default), cjs: !!(target.require ?? target.default) });
            }
        }
    } else {
        entries.push({ subpath: '.', esm: !!(data.module ?? data.main), cjs: !!data.main });
    }
    return entries;
};

const specifierOf = (name, subpath) => (subpath === '.' ? name : name + subpath.slice(1));

let failures = 0;
for (const { data } of packages) {
    for (const entry of entriesOf(data)) {
        const specifier = specifierOf(data.name, entry.subpath);
        for (const mode of ['esm', 'cjs']) {
            if (!entry[mode]) {
                continue;
            }
            const script = mode === 'esm'
                ? `const m = await import(${JSON.stringify(specifier)}); if (!m || typeof m !== 'object') throw new Error('no namespace'); console.log(Object.keys(m).length);`
                : `const m = require(${JSON.stringify(specifier)}); if (!m || (typeof m !== 'object' && typeof m !== 'function')) throw new Error('no exports'); console.log(typeof m === 'function' ? 1 : Object.keys(m).length);`;
            const arguments_ = mode === 'esm' ? ['--input-type=module', '-e', script] : ['-e', script];
            try {
                const output = execFileSync(process.execPath, arguments_, {
                    cwd: project,
                    stdio: ['ignore', 'pipe', 'pipe'],
                    env: { ...process.env, NODE_ENV: 'production' },
                    timeout: 60000,
                }).toString().trim();
                console.log(`  ok    ${specifier} [${mode}] ${output} exports`);
            } catch (error) {
                const stderr = (error.stderr ? error.stderr.toString() : error.message).split('\n')
                    .filter((line) => line.trim()).slice(0, 6).join('\n      ');
                console.log(`  FAIL  ${specifier} [${mode}]\n      ${stderr}`);
                failures += 1;
            }
        }
    }
}

if (!keep) {
    rmSync(work, { recursive: true, force: true });
} else {
    console.log('[smoke.pack] kept ' + project);
}

if (failures > 0) {
    console.error(`\n[smoke.pack] ${failures} entry point(s) failed as a packed install`);
    process.exit(1);
}
console.log(`\n[smoke.pack] every entry point of ${packages.length} packed packages installs and loads under ESM and CommonJS`);
