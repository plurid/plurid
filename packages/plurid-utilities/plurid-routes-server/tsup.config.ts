import { defineConfig } from 'tsup';


// Modern build (2026-06-17): tsup (esbuild) replacing rollup + ttypescript.
// Node library → dual ESM/CJS + dts, Node platform. express/body-parser/@plurid
// peers are auto-externalized by tsup.
export default defineConfig({
    entry: ['source/index.ts'],
    format: ['esm', 'cjs'],
    dts: true,
    outDir: 'distribution',
    platform: 'node',
    target: 'node18',
    sourcemap: true,
    clean: true,
    treeshake: false,
    external: [
        /^@plurid\//,
        'express', 'body-parser',
    ],
});
