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

/**
 * THE TWO FORMATS RENDER THE SAME PAGE. A server that `require`s a package and a browser bundle that
 * `import`s it hydrate one markup only if both builds create their styled components in one order:
 * styled-components numbers its component ids by creation. 2026-09-29: plurid-react's ESM build was
 * code-split and its CJS build was not, so the same 237 components were created in two orders and
 * every kit application failed to hydrate. Rendered here the way the kit's server renders a route.
 */
const RENDER_PARITY = ['@plurid/plurid-react'];

const renderThrough = (directory, mode, file) => {
    const script = `
        import { createRequire } from 'node:module';
        const require = createRequire(${JSON.stringify(join(directory, 'package.json'))});
        const React = require('react');
        const { renderToString } = require('react-dom/server');
        const { ServerStyleSheet, StyleSheetManager } = require('styled-components');
        const plurid = ${mode === 'esm' ? `await import(${JSON.stringify(file)})` : `require(${JSON.stringify(file)})`};
        const h = React.createElement;
        const routes = [{ value: '/', planes: [['/one', () => h('p', null, 'one')], ['/two', () => h('p', null, 'two')]], view: ['/one', '/two'] }];
        const sheet = new ServerStyleSheet();
        const html = renderToString(h(StyleSheetManager, { sheet: sheet.instance },
            h(plurid.PluridProvider, { metastate: undefined },
                h(plurid.PluridRouterStatic, { path: '/', routes, planes: [], hostname: 'localhost' }))));
        const css = sheet.getStyleTags();
        sheet.seal();
        process.stdout.write(JSON.stringify({ html, css }));
    `;
    return JSON.parse(execFileSync(process.execPath, ['--input-type=module', '-e', script], {
        cwd: directory,
        stdio: ['ignore', 'pipe', 'pipe'],
        env: { ...process.env, NODE_ENV: 'production' },
        timeout: 60000,
        maxBuffer: 64 * 1024 * 1024,
    }).toString());
};

const classesOf = (html) => [...html.matchAll(/class="([^"]*)"/g)].map((match) => match[1]);

for (const { directory, data } of packages) {
    if (!RENDER_PARITY.includes(data.name)) {
        continue;
    }
    const entry = entriesOf(data).find((candidate) => candidate.subpath === '.');
    try {
        const esm = renderThrough(directory, 'esm', resolve(directory, entry.esm));
        const cjs = renderThrough(directory, 'cjs', resolve(directory, entry.cjs));
        if (esm.html === cjs.html && esm.css === cjs.css) {
            console.log(`  ok    ${data.name} renders the same markup and styles through ESM and CommonJS (${classesOf(esm.html).length} classes)`);
            continue;
        }
        const esmClasses = classesOf(esm.html);
        const cjsClasses = classesOf(cjs.html);
        const at = esmClasses.findIndex((value, index) => value !== cjsClasses[index]);
        console.log(`  FAIL  ${data.name} renders differently through ESM and CommonJS — a server (require) and a browser (import) will not hydrate`
            + (at === -1 ? '' : `\n      first differing class, #${at}: esm "${esmClasses[at]}" · cjs "${cjsClasses[at]}"`));
        failures += 1;
    } catch (error) {
        const stderr = (error.stderr ? error.stderr.toString() : error.message).split('\n')
            .filter((line) => line.trim()).slice(0, 6).join('\n      ');
        console.log(`  FAIL  ${data.name} could not render through both formats\n      ${stderr}`);
        failures += 1;
    }
}

if (failures > 0) {
    console.error(`\n[check.modules] ${failures} check(s) failed`);
    process.exit(1);
}
console.log(`\n[check.modules] every entry point of ${packages.length} packages loads under ESM and CommonJS; ${RENDER_PARITY.join(', ')} renders the same through both`);
