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
import { readFileSync, readdirSync, existsSync } from 'node:fs';
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

/** A condition's file: a path, or a nested condition's `default` (`import: { types, default }`). */
const fileOf = (value) => (typeof value === 'string'
    ? value
    : value && typeof value === 'object' ? fileOf(value.default) : undefined);

/** A condition's declarations: a nested condition's `types` (the `import` one `.d.mts`, the `require` one `.d.ts`). */
const typesOf = (value) => (value && typeof value === 'object' ? value.types : undefined);

/** Whether a subpath is a module (`./package.json` is data, read with `require` or an import attribute). */
const isModule = (file) => typeof file === 'string' && /\.(c|m)?js$/.test(file);

/** The (subpath, import target, require target, and their declarations) of a package's `exports` map, or main/module. */
const entriesOf = (data) => {
    const entries = [];
    const exportsMap = data.exports;
    if (exportsMap && typeof exportsMap === 'object') {
        for (const [subpath, target] of Object.entries(exportsMap)) {
            if (typeof target === 'string') {
                if (isModule(target)) {
                    entries.push({ subpath, esm: target, cjs: target });
                }
            } else if (target && typeof target === 'object') {
                const esm = target.import ?? target.default;
                const cjs = target.require ?? target.default;
                entries.push({ subpath, esm: fileOf(esm), cjs: fileOf(cjs), esmTypes: typesOf(esm), cjsTypes: typesOf(cjs), flatTypes: target.types });
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
    // THE TYPES MATCH THE FORMAT (2026-09-29): one `types` for both conditions handed an ESM consumer
    // (`module: NodeNext`) the CommonJS declarations, and `new PluridServer(…)` did not compile (TS2351).
    // Each condition carries its own: `.d.mts` under `import`, `.d.ts` under `require`, both on disk.
    for (const entry of entriesOf(data)) {
        const problems = [];
        if (entry.flatTypes) {
            problems.push(`a flat \`types\` (${entry.flatTypes}) serves both formats; nest it under \`import\` / \`require\``);
        }
        for (const [condition, types, extension] of [['import', entry.esmTypes, '.d.mts'], ['require', entry.cjsTypes, '.d.ts']]) {
            if (!data.exports || !types) {
                continue;
            }
            if (!types.endsWith(extension)) {
                problems.push(`the \`${condition}\` declarations are ${types}, not a ${extension}`);
            } else if (!existsSync(resolve(directory, types))) {
                problems.push(`the \`${condition}\` declarations ${types} are missing — build first (pnpm build)`);
            }
        }
        if (data.exports && entry.esm && !entry.esmTypes) {
            problems.push('no declarations under `import`');
        }
        if (problems.length > 0) {
            console.log(`  FAIL  ${data.name} ${entry.subpath} [types]\n      ${problems.join('\n      ')}`);
            failures += 1;
        }
    }
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

/**
 * CLIENT BOUNDARIES (2026-09-29): every file the React adapter emits, entries and chunks of both formats,
 * begins with `'use client'`, so a React Server Components bundler treats the package as client code
 * instead of evaluating its hooks on the server. The directive is written after the build (tsup's
 * tree-shaking drops an esbuild banner): checked here, so a build change cannot drop it unnoticed.
 */
const CLIENT_BOUNDARIES = ['@plurid/plurid-react'];

for (const { directory, data } of packages) {
    if (!CLIENT_BOUNDARIES.includes(data.name)) {
        continue;
    }
    const distribution = join(directory, 'distribution');
    const files = existsSync(distribution) ? readdirSync(distribution).filter((name) => /\.m?js$/.test(name)) : [];
    const unmarked = files.filter((name) => !readFileSync(join(distribution, name), 'utf8').startsWith("'use client';"));
    if (files.length === 0 || unmarked.length > 0) {
        console.log(`  FAIL  ${data.name} emits files without a leading 'use client': ${unmarked.slice(0, 4).join(', ') || 'no files — build first (pnpm build)'}`);
        failures += 1;
    } else {
        console.log(`  ok    ${data.name} begins every one of its ${files.length} emitted files with 'use client'`);
    }
}

if (failures > 0) {
    console.error(`\n[check.modules] ${failures} check(s) failed`);
    process.exit(1);
}
console.log(`\n[check.modules] every entry point of ${packages.length} packages loads under ESM and CommonJS, with its own declarations per format; ${RENDER_PARITY.join(', ')} renders the same through both`);
