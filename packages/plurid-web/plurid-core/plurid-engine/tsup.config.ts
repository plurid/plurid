import { defineConfig } from 'tsup';


// Modern build (2026-06-17): replaces the deprecated rollup + ttypescript +
// rollup-plugin-terser + ts-transform-paths stack. esbuild resolves path aliases
// natively; dts emits declarations. Dual ESM + CJS.
export default defineConfig({
    entry: ['source/index.ts'],
    format: ['esm', 'cjs'],
    dts: true,
    outDir: 'distribution',
    sourcemap: true,
    clean: true,
    treeshake: true,
    // workspace siblings stay external (not bundled in)
    external: [/^@plurid\//],
});
