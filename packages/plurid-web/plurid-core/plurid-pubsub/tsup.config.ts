import { defineConfig } from 'tsup';


// Modern build (2026-06-17): tsup (esbuild) replacing rollup + ttypescript + terser.
export default defineConfig({
    entry: ['source/index.ts'],
    format: ['esm', 'cjs'],
    dts: true,
    outDir: 'distribution',
    sourcemap: true,
    clean: true,
    treeshake: true,
    external: [/^@plurid\//],
});
