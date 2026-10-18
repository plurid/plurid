#!/usr/bin/env node
/** Build dependency-first without removing any existing outputs. Release packing uses a fresh tree. */
import { execFileSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { listWorkspace, releaseOrder } from './release-plan.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
for (const project of releaseOrder(listWorkspace(root))) {
    console.log('[build] ' + project.data.name);
    // Use tsup's config loader. Inheriting --import tsx breaks its declaration-build worker.
    execFileSync(process.execPath, ['--input-type=module', '-e',
        "import {build} from 'tsup'; await build({config:'tsup.config.ts',clean:false});"], {
        cwd: project.directory, stdio: 'inherit', env: process.env,
    });
}
