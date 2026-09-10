#!/usr/bin/env node
/**
 * `pnpm bench`: the harness's benchmark project as a table. Runs `bench.spec.ts` (the orbit run on
 * 40 / 100 / 500 planes, the relayout and spawn runs on 40 / 100) through Playwright's JSON reporter
 * and prints every `[bench]` annotation as one row — the repeatable performance scenarios of the
 * diagnostic surface. `BENCH_STRICT=1` applies the absolute p95 budgets.
 */
import { spawnSync } from 'node:child_process';
import { readFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const directory = mkdtempSync(join(tmpdir(), 'plurid-bench-'));
const report = join(directory, 'report.json');
// the JSON goes to the file, the list reporter streams every `[bench]` line as it lands
const run = spawnSync('npx', [
    'playwright', 'test', '--config', 'e2e/playwright.config.ts', '--project=chromium', 'e2e/bench.spec.ts',
    '--reporter=json,list',
], {
    cwd: join(root, 'fixtures', 'render-test'),
    env: { ...process.env, PLAYWRIGHT_JSON_OUTPUT_NAME: report },
    stdio: ['ignore', 'inherit', 'inherit'],
    encoding: 'utf8',
});

let results;
try {
    results = JSON.parse(readFileSync(report, 'utf8'));
} catch (error) {
    console.error('[bench] no report (' + (error && error.message) + ')');
    process.exit(run.status || 1);
}

const rows = [];
const walk = (suite) => {
    for (const spec of suite.specs || []) {
        for (const test of spec.tests || []) {
            for (const annotation of test.annotations || []) {
                if (annotation.type !== 'bench') continue;
                const match = /^(?:(\w+) )?(\d+) planes (\{.*\})$/.exec(annotation.description);
                if (!match) continue;
                const data = JSON.parse(match[3]);
                rows.push({ scenario: match[1] || 'orbit', planes: Number(match[2]), ...data });
            }
        }
    }
    for (const child of suite.suites || []) walk(child);
};
for (const suite of results.suites || []) walk(suite);

if (rows.length === 0) {
    console.error('[bench] no rows');
    process.exit(run.status || 1);
}
const columns = ['scenario', 'planes', 'p50FrameMs', 'p95FrameMs', 'maxFrameMs', 'dispatches', 'frames', 'bootMs'];
const width = Object.fromEntries(columns.map((column) => [column, Math.max(column.length, ...rows.map((row) => String(row[column] ?? '').length))]));
const line = (values) => columns.map((column) => String(values[column] ?? '').padEnd(width[column])).join('  ');
console.log(line(Object.fromEntries(columns.map((column) => [column, column]))));
console.log(columns.map((column) => '-'.repeat(width[column])).join('  '));
for (const row of rows) console.log(line(row));
process.exit(run.status || 0);
