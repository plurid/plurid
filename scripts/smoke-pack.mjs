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
import { execFileSync, execSync, spawn } from 'node:child_process';
import { readFileSync, existsSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { createServer } from 'node:net';
import { resolve, dirname, join } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');
const keep = process.argv.includes('--keep');


/** Peers the packages declare that live outside this repository (installed from the registry). */
const EXTERNAL_PEERS = [
    'react@19', 'react-dom@19', 'styled-components@6', '@reduxjs/toolkit@2', 'react-redux@9', 'redux@5',
];

/** The workspace's public projects, from pnpm itself (a directory outside the workspace globs is not published from here). */
const listWorkspace = () => {
    const output = execFileSync('pnpm', ['-r', 'ls', '--depth', '-1', '--json'], { cwd: root, stdio: ['ignore', 'pipe', 'ignore'], timeout: 120000 }).toString();
    const projects = JSON.parse(output);
    return projects
        .filter((project) => project.name && !project.private && !project.path.includes('/fixtures/'))
        .map((project) => ({ directory: project.path, data: JSON.parse(readFileSync(join(project.path, 'package.json'), 'utf8')) }));
};

/** A port nobody holds right now (bound to 0, read, released): the generated server's. */
const freePort = () => new Promise((resolvePort, reject) => {
    const probe = createServer();
    probe.unref();
    probe.on('error', reject);
    probe.listen(0, '127.0.0.1', () => {
        const { port } = probe.address();
        probe.close(() => resolvePort(port));
    });
});

/** Chromium, through the harness's Playwright (CI installs its browser); `PLURID_CHROMIUM` points at another build. */
const launchChromium = () => {
    const { chromium } = createRequire(join(root, 'fixtures', 'render-test', 'package.json'))('@playwright/test');
    return chromium.launch(process.env.PLURID_CHROMIUM ? { executablePath: process.env.PLURID_CHROMIUM } : {});
};

/* global document, window -- the functions handed to `page.addInitScript`, `page.waitForFunction` and `page.evaluate` below run in the page, not in Node */

/**
 * Load `url` as a reader does, wait until React has hydrated the first plurid link, follow it, and
 * return what went wrong: every console error and page error (a hydration mismatch is one of them),
 * every warning of the engine's (`[plurid] …`: the generated application is a host that follows the
 * engine's advice), a link that did not open its page, a server page that is blank before its
 * script runs, and a docked page that is not the window's before its script runs or moves while it
 * hydrates. Waits on state, never on time.
 */
const visit = async (browser, url) => {
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
    const problems = [];
    page.on('console', (message) => {
        if (message.type() === 'error' || (message.type() === 'warning' && message.text().startsWith('[plurid]'))) {
            problems.push(message.text());
        }
    });
    page.on('pageerror', (error) => problems.push(error.message));
    // every frame from the document's start until read: the docked page's box, as painted
    await page.addInitScript(() => {
        const boxes = [];
        window.__pluridDockedBoxes = boxes;
        const tick = () => {
            const docked = document.querySelector('[data-plurid-page="docked"]');
            if (docked) {
                const rect = docked.getBoundingClientRect();
                const box = [rect.x, rect.y, rect.width, rect.height].map(Math.round).join(',');
                if (boxes[boxes.length - 1] !== box) {
                    boxes.push(box);
                }
            }
            if (!window.__pluridDockedStop) {
                window.requestAnimationFrame(tick);
            }
        };
        window.requestAnimationFrame(tick);
    });
    try {
        await page.goto(url, { waitUntil: 'load' });
        const link = 'a[data-plurid-entity="PluridLink"]';
        // hydrated: React keeps its props on every element it owns, and on no server-only markup
        await page.waitForFunction((selector) => {
            const anchor = document.querySelector(selector);
            return !!anchor && Object.keys(anchor).some((key) => key.startsWith('__reactProps'));
        }, link, { timeout: 30000 });
        // THE PAGE DOES NOT MOVE AT HYDRATION (2026-09-29: the server laid the page out for its
        // 771 x 764 fallback view, and the page grew to the window once the script measured it):
        // every frame from the first paint to the hydrated page shows the docked page as the view
        const frames = await page.evaluate(() => {
            window.__pluridDockedStop = true;
            const rect = document.querySelector('[data-plurid-entity="PluridView"]').getBoundingClientRect();
            return {
                view: [rect.x, rect.y, rect.width, rect.height].map(Math.round).join(','),
                boxes: window.__pluridDockedBoxes,
            };
        });
        if (frames.boxes.length === 0) {
            problems.push('no page was docked while the page loaded and hydrated');
        } else if (frames.boxes.some((box) => box !== frames.view)) {
            problems.push(`the docked page moved while the page loaded and hydrated: ${frames.boxes.join(' -> ')} (x,y,width,height) in a ${frames.view} view`);
        }
        await page.click(link);
        const opened = await page.waitForFunction(
            () => (document.querySelector('[data-plurid-docked]')?.getAttribute('data-plurid-docked') || '').includes('/about'),
            undefined,
            { timeout: 15000 },
        ).then(() => true, () => false);
        if (!opened) {
            problems.push('the first link did not open its page (/about)');
        }
    } catch (error) {
        problems.push(error.message.split('\n')[0]);
    } finally {
        await page.close();
    }

    // THE SERVER'S PAGE IS A PAGE before any script runs (2026-09-29: the template left `html` and the
    // root without a height, so the view resolved to 0 px, and the space rendered at opacity 0 until the
    // browser's first layout: the first paint was black until hydration, twice over), and it is the
    // WINDOW'S page, on a desktop and on a phone (it was a 771 x 764 box in every window)
    for (const viewport of [{ width: 1280, height: 800 }, { width: 390, height: 844 }]) {
        const bare = await browser.newContext({ javaScriptEnabled: false, viewport });
        const size = `${viewport.width}x${viewport.height}`;
        try {
            const still = await bare.newPage();
            await still.goto(url, { waitUntil: 'load' });
            const paint = await still.evaluate(() => {
                const view = document.querySelector('[data-plurid-entity="PluridView"]');
                const content = document.querySelector('[data-plurid-entity="PluridPlaneContent"]');
                const docked = document.querySelector('[data-plurid-page="docked"]');
                const boxOf = (element) => {
                    if (!element) {
                        return '';
                    }
                    const rect = element.getBoundingClientRect();
                    return [rect.x, rect.y, rect.width, rect.height].map(Math.round).join(',');
                };
                // hit-test with every element in play: a cover takes no pointer events, and hides from it
                const probe = document.createElement('style');
                probe.textContent = '* { pointer-events: auto !important; }';
                document.head.appendChild(probe);
                const box = content ? content.getBoundingClientRect() : null;
                const top = box ? document.elementFromPoint(box.left + Math.min(20, box.width / 2), box.top + Math.min(20, box.height / 2)) : null;
                probe.remove();
                return {
                    view: view ? view.getBoundingClientRect().height : 0,
                    content: !!content && content.checkVisibility({ opacityProperty: true, visibilityProperty: true }),
                    covered: !!content && !(top && content.contains(top)),
                    viewBox: boxOf(view),
                    dockedBox: boxOf(docked),
                };
            });
            if (paint.view === 0) {
                problems.push(`(${size}) before its script runs the server's page has a 0 px view: it paints blank`);
            }
            if (!paint.content) {
                problems.push(`(${size}) before its script runs the server's page hides its content: it paints blank`);
            }
            if (paint.covered) {
                problems.push(`(${size}) before its script runs something covers the server's page: it paints blank`);
            }
            if (paint.dockedBox !== paint.viewBox) {
                problems.push(`(${size}) before its script runs the server's page is not the window's: a ${paint.dockedBox || 'missing'} page in a ${paint.viewBox} view (x,y,width,height)`);
            }
        } catch (error) {
            problems.push(`(${size}) ` + error.message.split('\n')[0]);
        } finally {
            await bare.close();
        }
    }
    return problems;
};

const packages = listWorkspace();

const work = mkdtempSync(join(tmpdir(), 'plurid-smoke-'));
const tarballs = join(work, 'tarballs');
const project = join(work, 'project');
execSync(`mkdir -p ${JSON.stringify(tarballs)} ${JSON.stringify(project)}`);
console.log('[smoke.pack] packing ' + packages.length + ' packages into ' + tarballs);

let failures = 0;
try {

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

// THE GENERATED APPLICATION: the PACKED generator (installed into the throwaway with the rest, so
// its `files` list and its binder are what runs) writes the kit's shape, the packed tarballs stand in
// for the registry, `plurid build` bundles it, the server answers `/` with the space — the consumer's
// first hour, end to end. `SMOKE_SKIP_GENERATE=1` skips it.
if (!process.env.SMOKE_SKIP_GENERATE && failures === 0) {
    const generator = join(project, 'node_modules', '.bin', 'generate-plurid-app');
    if (!existsSync(generator)) {
        console.log('[smoke.pack] no generator binary among the packed packages: the generated-app smoke is skipped');
    } else {
        const app = join(work, 'generated');
        console.log('[smoke.pack] generating an application into ' + app + ' with the packed generator');
        execFileSync(generator, ['-d', app, '-m', 'npm', '--no-install'], {
            cwd: work, stdio: ['ignore', 'pipe', 'pipe'], timeout: 120000,
        });
        const manifest = JSON.parse(readFileSync(join(app, 'package.json'), 'utf8'));
        for (const script of ['dev', 'build', 'start', 'check']) {
            if (!manifest.scripts[script]) throw new Error('[smoke.pack] the generated manifest lacks the ' + script + ' script');
        }
        if (!existsSync(join(app, '.gitignore'))) throw new Error('[smoke.pack] the generated application has no .gitignore');
        console.log('[smoke.pack] installing the generated application from the tarballs (a minute)');
        // the packed packages instead of the registry versions the manifest names; the peers from the registry
        execFileSync('npm', ['install', '--no-audit', '--no-fund', '--loglevel=error', '--strict-peer-deps', ...tarballFiles, 'react@19', 'react-dom@19', 'styled-components@6', 'typescript@5', '@types/react@19', '@types/react-dom@19'], {
            cwd: app, stdio: ['ignore', 'pipe', 'pipe'], timeout: 600000,
        });
        console.log('[smoke.pack] plurid build');
        execFileSync('npx', ['plurid', 'build'], { cwd: app, stdio: ['ignore', 'pipe', 'pipe'], timeout: 300000, env: { ...process.env, NODE_ENV: 'production' } });
        if (!existsSync(join(app, 'build', 'index.js'))) throw new Error('[smoke.pack] plurid build wrote no build/index.js');
        // `plurid start` / `plurid dev` on $PORT, in a process group of their own: the server they spawn
        // goes with them
        const serve = async (command) => {
            const port = await freePort();
            const child = spawn(join(app, 'node_modules', '.bin', 'plurid'), [command], {
                cwd: app, env: { ...process.env, PORT: String(port) }, stdio: ['ignore', 'pipe', 'pipe'], detached: true,
            });
            let output = '';
            child.stdout.on('data', (chunk) => { output += chunk.toString(); });
            child.stderr.on('data', (chunk) => { output += chunk.toString(); });
            const url = 'http://127.0.0.1:' + port + '/';
            let body = '';
            const started = Date.now();
            while (Date.now() - started < 60000) {
                try {
                    const response = await fetch(url);
                    body = await response.text();
                    if (response.status === 200) break;
                } catch {
                    // not up yet
                }
                await new Promise((resolve) => setTimeout(resolve, 500));
            }
            return {
                url,
                body,
                output: () => output.split('\n').filter((line) => line.trim()).slice(-12).join('\n      '),
                stop: () => {
                    try {
                        process.kill(-child.pid, 'SIGTERM');
                    } catch {
                        // already gone
                    }
                },
            };
        };

        // THE PAGE HYDRATES (2026-09-29): the browser's first render is the server's markup, in the
        // production artifact and in the development loop (whose React reports every mismatch; the
        // production one reports only those that throw the page away), and the first link opens its
        // page. Every generated application failed this while every check above passed: the server
        // rendered its styled components in one order and its planes on one host, the browser in
        // another order and on another host. `SMOKE_SKIP_BROWSER=1` skips it.
        let browser;
        const browse = async (label, served) => {
            if (process.env.SMOKE_SKIP_BROWSER || browser === null) {
                return;
            }
            if (!browser) {
                try {
                    browser = await launchChromium();
                } catch (error) {
                    failures += 1;
                    console.log('  FAIL  no Chromium to load the generated application in: `pnpm --filter plurid-render-test exec playwright install chromium`, or PLURID_CHROMIUM=<path> (SMOKE_SKIP_BROWSER=1 skips)'
                        + '\n      ' + error.message.split('\n')[0]);
                    // tried once: the next target is not a second failure for the same reason
                    browser = null;
                    return;
                }
            }
            const problems = await visit(browser, served.url);
            if (problems.length > 0) {
                failures += 1;
                console.log(`  FAIL  the generated application (${label}) does not load cleanly in Chromium:\n      `
                    + problems.slice(0, 4).map((problem) => problem.replace(/\s+/g, ' ').slice(0, 400)).join('\n      '));
            } else {
                console.log(`  ok    the generated application (${label}) paints the window's page before its script runs, on a desktop and on a phone, hydrates in Chromium without an error, an engine warning or a moved page, and its first link opens its page`);
            }
        };

        try {
            console.log('[smoke.pack] plurid start → GET / → Chromium');
            const production = await serve('start');
            try {
                if (!production.body.includes('data-plurid-entity="PluridView"')) {
                    failures += 1;
                    console.log('  FAIL  the generated application did not serve the space at / (got ' + production.body.length + ' bytes)');
                    console.log('      ' + production.output());
                } else {
                    console.log('  ok    the generated application builds, starts and serves the space at /');
                    await browse('plurid start', production);
                }
            } finally {
                production.stop();
            }

            // the development loop rebuilds into the same build directory: only once the production server is down
            console.log('[smoke.pack] plurid dev → Chromium');
            const development = await serve('dev');
            try {
                if (!development.body.includes('data-plurid-entity="PluridView"')) {
                    failures += 1;
                    console.log('  FAIL  plurid dev did not serve the space at / (got ' + development.body.length + ' bytes)');
                    console.log('      ' + development.output());
                } else {
                    await browse('plurid dev', development);
                }
            } finally {
                development.stop();
            }
        } finally {
            await browser?.close();
        }
    }
}
} finally {
    // a failed run must not leave hundreds of MB behind (nor a server: the spawn above is killed in its own finally)
    if (!keep) {
        rmSync(work, { recursive: true, force: true });
    } else {
        console.log('[smoke.pack] kept ' + work);
    }
}

if (failures > 0) {
    console.error(`\n[smoke.pack] ${failures} check(s) failed as a packed install`);
    process.exit(1);
}
console.log(`\n[smoke.pack] every entry point of ${packages.length} packed packages installs and loads under ESM and CommonJS`);
