import { defineConfig } from 'tsup';


// Modern build (2026-06-18): tsup (esbuild) replacing rollup + rollup-plugin-typescript2 + terser,
// matching the plurid-core packages. Pure-TS leaf — no runtime deps to externalize beyond @plurid.
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
