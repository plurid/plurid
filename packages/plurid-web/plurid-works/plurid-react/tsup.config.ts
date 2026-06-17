import { defineConfig } from 'tsup';


// Modern build (2026-06-17): tsup (esbuild) replacing rollup + ttypescript + terser.
// React JSX + dual ESM/CJS + dts. All @plurid siblings and the React/redux/styled
// ecosystem are peers → kept external (not bundled).
export default defineConfig({
    entry: ['source/index.tsx'],
    format: ['esm', 'cjs'],
    dts: true,
    outDir: 'distribution',
    sourcemap: true,
    clean: true,
    treeshake: false,
    external: [
        /^@plurid\//,
        'react', 'react-dom', 'react/jsx-runtime',
        'styled-components', 'redux', 'react-redux', '@reduxjs/toolkit',
        'cross-fetch', 'immer',
    ],
});
