#!/usr/bin/env node
/**
 * THE BUNDLE BUDGET. Every public package's published ESM entry point, measured the way a consumer
 * pays for it — gzipped, with the chunks the entry pulls in — against a committed budget.
 *
 * Why this exists: the audit asked for it twice ("control bundle growth", "no per-package budgets, no
 * bundle reports in CI") and `pnpm size` was named in the docs as a target that did not exist. Growth
 * is invisible without a number: nothing here fails until a package crosses its own line.
 *
 *   pnpm size              measure and check against configurations/size-budgets.json
 *   pnpm size --update     rewrite the budgets from what is on disk now (after a deliberate change)
 *   pnpm size --json       machine-readable
 *
 * The budget of a package is its measured size rounded UP to the next 5 KB with at least 2 KB of
 * room, so ordinary churn never trips it and a real regression does. Same lesson as the coverage
 * floors, in the other direction.
 */
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { gzipSync } from 'node:zlib';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');
const BUDGETS = join(root, 'configurations/size-budgets.json');

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

/**
 * What the consumer downloads for one entry point: the entry plus every chunk beside it, gzipped.
 * tsup code-splits the ESM build, so the entry file alone is a barrel and says nothing.
 */
const measure = (directory) => {
    const distribution = join(directory, 'distribution');
    if (!existsSync(distribution)) {
        return null;
    }
    let bytes = 0;
    for (const name of readdirSync(distribution)) {
        // the shipped ESM: the entry and its chunks. Not .js (CJS), not .map, not .d.ts.
        if (!name.endsWith('.mjs')) {
            continue;
        }
        const file = join(distribution, name);
        if (!statSync(file).isFile()) {
            continue;
        }
        bytes += gzipSync(readFileSync(file)).length;
    }
    return bytes;
};

const kilobytes = (bytes) => Math.round(bytes / 1024 * 10) / 10;
/**
 * A budget is the measurement rounded UP to the next 5 KB, with at least 2 KB of room — the same
 * lesson as the coverage floors: a line drawn exactly where you stand turns red on the next ordinary
 * commit, and a gate that cries wolf gets raised until it means nothing.
 */
const budgetFor = (bytes) => Math.ceil((kilobytes(bytes) + 2) / 5) * 5;

const packages = listWorkspace();
const budgets = existsSync(BUDGETS) ? JSON.parse(readFileSync(BUDGETS, 'utf8')) : {};

const rows = [];
let missing = 0;
for (const { directory, data } of packages) {
    const bytes = measure(directory);
    if (bytes === null) {
        console.error(`[size] ${data.name}: no distribution/ — run \`pnpm build\` first`);
        missing += 1;
        continue;
    }
    rows.push({ name: data.name, kb: kilobytes(bytes), budget: budgets[data.name] });
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
    console.log(`[size] budgets written for ${rows.length} packages → configurations/size-budgets.json`);
    process.exit(0);
}

if (asJson) {
    console.log(JSON.stringify(rows, null, 4));
}

const over = rows.filter((row) => row.budget !== undefined && row.kb > row.budget);
const unbudgeted = rows.filter((row) => row.budget === undefined);

if (!asJson) {
    const width = Math.max(...rows.map((row) => row.name.length));
    console.log(`[size] published ESM, gzipped\n`);
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
console.log(`[size] ${rows.length} packages within budget`);
