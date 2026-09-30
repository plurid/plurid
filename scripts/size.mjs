#!/usr/bin/env node
/**
 * THE BUNDLE BUDGET. Every public ESM entry point (each `exports` subpath: `@plurid/plurid-react`,
 * `@plurid/plurid-react/testing` …), measured the way an application pays for it — the entry and
 * every chunk it imports STATICALLY, minified as the application's bundler minifies them, gzipped —
 * against a committed budget.
 *
 * Measured as shipped since 2026-09-29. It summed every `.mjs` file unminified: the whitespace and
 * names a bundler strips, the `testing` entry an application never loads, and the lazy debugger
 * chunks it loads only on demand, counted as if the application downloaded them all; the React
 * adapter read 147 of its 150 KB for what ships as far less.
 *
 * Why this exists: the audit asked for it twice ("control bundle growth", "no per-package budgets, no
 * bundle reports in CI") and `pnpm size` was named in the docs as a target that did not exist. Growth
 * is invisible without a number: nothing here fails until a package crosses its own line.
 *
 *   pnpm size              measure and check against configurations/size-budgets.json
 *   pnpm size --update     rewrite the budgets from what is on disk now (after a deliberate change)
 *   pnpm size --json       machine-readable
 *
 * The budget of an entry is its measured size rounded UP to the next 5 KB with at least 2 KB of
 * room, or 5 % of the entry where that is more (a large entry grows by more than a small one in an
 * ordinary feature), so ordinary churn never trips it and a real regression does. Same lesson as
 * the coverage floors, in the other direction.
 */
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { gzipSync } from 'node:zlib';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');
const BUDGETS = join(root, 'configurations/size-budgets.json');

/** esbuild, through the kit that depends on it (the root has no build tool of its own). */
const esbuild = createRequire(join(root, 'packages/plurid-web/plurid-works/plurid-kit/package.json'))('esbuild');

const update = process.argv.includes('--update');
const asJson = process.argv.includes('--json');

/** The workspace's public projects, from pnpm itself. */
const listWorkspace = () => {
    const output = execFileSync('pnpm', ['-r', 'ls', '--depth', '-1', '--json'], {
        cwd: root, stdio: ['ignore', 'pipe', 'ignore'], timeout: 120000,
    }).toString();
    return JSON.parse(output)
        .filter((project) => project.name && !project.private && !project.path.includes('/fixtures/'))
        .map((project) => ({ directory: project.path, data: JSON.parse(readFileSync(join(project.path, 'package.json'), 'utf8')) }))
        .sort((a, b) => a.data.name.localeCompare(b.data.name));
};

/** The ESM entry points an application can import: the `exports` map's `import` targets, else `module`. */
const entriesOf = (directory, data) => {
    const entries = [];
    if (data.exports && typeof data.exports === 'object') {
        for (const [subpath, target] of Object.entries(data.exports)) {
            const condition = typeof target === 'string' ? target : (target.import ?? target.module ?? target.default);
            // a nested condition (`import: { types, default }`) names its file under `default`
            const file = condition && typeof condition === 'object' ? condition.default : condition;
            if (typeof file === 'string' && file.endsWith('.mjs')) {
                entries.push({ name: subpath === '.' ? data.name : data.name + subpath.slice(1), file: join(directory, file) });
            }
        }
    } else if (typeof data.module === 'string') {
        entries.push({ name: data.name, file: join(directory, data.module) });
    }
    return entries;
};

/** A static `import … from './x'`, `export … from './x'` or `import './x'`; never a lazy `import('./x')`. */
const STATIC_IMPORT = /(?:^|[\s;])(?:import|export)\s*(?:[^'"`]*?\sfrom\s*)?['"](\.{1,2}\/[^'"]+)['"]/g;

/** The entry and every file it loads with it: its static imports, transitively (the shared chunks). */
const closureOf = (entry) => {
    const seen = new Set();
    const visit = (file) => {
        if (seen.has(file) || !existsSync(file)) {
            return;
        }
        seen.add(file);
        for (const match of readFileSync(file, 'utf8').matchAll(STATIC_IMPORT)) {
            visit(resolve(dirname(file), match[1]));
        }
    };
    visit(entry);
    return [...seen];
};

/** What an application ships for one entry: its closure, minified, gzipped as one (as a bundle is). */
const measure = (entry) => {
    if (!existsSync(entry)) {
        return null;
    }
    const minified = closureOf(entry)
        .map((file) => esbuild.transformSync(readFileSync(file, 'utf8'), {
            loader: 'js',
            format: 'esm',
            minify: true,
            legalComments: 'none',
        }).code)
        .join('\n');
    return gzipSync(minified).length;
};

const kilobytes = (bytes) => Math.round(bytes / 1024 * 10) / 10;
/**
 * A budget is the measurement rounded UP to the next 5 KB, with at least 2 KB of room (5 % of a large
 * entry) — the same lesson as the coverage floors: a line drawn exactly where you stand turns red on
 * the next ordinary commit, and a gate that cries wolf gets raised until it means nothing.
 */
const budgetFor = (bytes) => {
    const kb = kilobytes(bytes);
    return Math.ceil((kb + Math.max(2, kb * 0.05)) / 5) * 5;
};

const packages = listWorkspace();
const budgets = existsSync(BUDGETS) ? JSON.parse(readFileSync(BUDGETS, 'utf8')) : {};

const rows = [];
let missing = 0;
for (const { directory, data } of packages) {
    for (const entry of entriesOf(directory, data)) {
        const bytes = measure(entry.file);
        if (bytes === null) {
            console.error(`[size] ${entry.name}: no ${entry.file.slice(directory.length + 1)} — run \`pnpm build\` first`);
            missing += 1;
            continue;
        }
        rows.push({ name: entry.name, kb: kilobytes(bytes), budget: budgets[entry.name] });
    }
}

if (missing > 0) {
    process.exit(1);
}

if (update) {
    const next = {};
    for (const row of rows) {
        next[row.name] = budgetFor(row.kb * 1024);
    }
    writeFileSync(BUDGETS, JSON.stringify(next, null, 4) + '\n');
    console.log(`[size] budgets written for ${rows.length} entry points → configurations/size-budgets.json`);
    process.exit(0);
}

if (asJson) {
    console.log(JSON.stringify(rows, null, 4));
}

const over = rows.filter((row) => row.budget !== undefined && row.kb > row.budget);
const unbudgeted = rows.filter((row) => row.budget === undefined);

if (!asJson) {
    const width = Math.max(...rows.map((row) => row.name.length));
    console.log(`[size] shipped ESM per entry point: the entry and its static chunks, minified, gzipped\n`);
    for (const row of rows) {
        const budget = row.budget === undefined ? '   (no budget)' : `/ ${String(row.budget).padStart(5)} KB`;
        const mark = row.budget !== undefined && row.kb > row.budget ? '  OVER' : '';
        console.log(`  ${row.name.padEnd(width)}  ${String(row.kb).padStart(7)} KB ${budget}${mark}`);
    }
    console.log('');
}

for (const row of over) {
    console.error(`[size] ${row.name} is ${row.kb} KB, over its ${row.budget} KB budget.`
        + ' Reduce it, or raise the budget in configurations/size-budgets.json in the same commit,'
        + ' with the reason in the message.');
}
for (const row of unbudgeted) {
    console.error(`[size] ${row.name} has no budget — run \`pnpm size --update\` and commit it.`);
}

if (over.length > 0 || unbudgeted.length > 0) {
    process.exit(1);
}
console.log(`[size] ${rows.length} entry points within budget`);
