import { defineConfig } from 'tsup';
import { cp } from 'node:fs/promises';


// Modern build (2026-06-17): tsup (esbuild) replacing the bespoke esbuild script.
// Node CLI scaffolder → CJS + ESM, Node platform. commander/inquirer/ora are
// auto-externalized. The `templates/` tree is copied into distribution afterwards
// (the CLI reads templates relative to its dist).
export default defineConfig({
    entry: ['source/index.ts'],
    format: ['cjs', 'esm'],
    dts: false,
    outDir: 'distribution',
    platform: 'node',
    target: 'node18',
    sourcemap: true,
    clean: true,
    treeshake: false,
    async onSuccess() {
        await cp('./templates', './distribution/templates', { recursive: true });
    },
});
