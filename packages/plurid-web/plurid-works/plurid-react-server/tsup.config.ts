import { defineConfig } from 'tsup';


// Modern build (2026-06-17): tsup (esbuild) replacing rollup + ttypescript.
// Node SSR library → dual ESM/CJS + dts, Node platform. Runtime deps (express,
// compression, …) and @plurid/react peers are auto-externalized by tsup.
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
        'react', 'react-dom', 'react/jsx-runtime',
        'styled-components', 'redux', 'react-redux', 'react-helmet-async',
        'cross-fetch',
    ],
});
