#!/usr/bin/env node
/** Run every package's configured tests and coverage floor, retaining fixtures and coverage. */
import { execFileSync } from 'node:child_process';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { listWorkspace } from './release-plan.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const coverage = mkdtempSync(join(tmpdir(), 'plurid-coverage-'));
console.log('[test] Coverage and fixtures retained; coverage: ' + coverage);
for (const project of listWorkspace(root)) {
    console.log('[test] ' + project.data.name);
    execFileSync('pnpm', ['test', '--runInBand', '--no-cache', '--coverageDirectory',
        join(coverage, project.data.name.replace('@plurid/', ''))], {
        cwd: project.directory, stdio: 'inherit',
        env: { ...process.env, PLURID_PRESERVE_ARTIFACTS: '1' },
    });
}
