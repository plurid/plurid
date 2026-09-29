import { defineConfig } from 'tsup';

import { cjsInteropPlugin } from '../../../../scripts/tsup/cjs-interop.mjs';


// Modern build (2026-06-17): tsup (esbuild) replacing rollup + ttypescript + terser.
// React JSX + dual ESM/CJS + dts. All @plurid siblings and the React/redux/styled
// ecosystem are peers → kept external (not bundled).
export default defineConfig({
    entry: {
        index: 'source/index.tsx',
        testing: 'source/testing/index.tsx',
    },
    format: ['esm', 'cjs'],
    // styled-components / react-helmet-async are CommonJS under native Node ESM: read them
    // through the interop shim (scripts/tsup/cjs-interop.mjs), so the packed ESM entry imports.
    esbuildPlugins: [cjsInteropPlugin()],
    // tsup's own externals plugin runs BEFORE user plugins; these two must not be pre-externalized
    // or the shim never sees them (the shim marks the real module external itself).
    noExternal: ['styled-components'],
    dts: true,
    outDir: 'distribution',
    sourcemap: true,
    clean: true,
    treeshake: true,
    // BOTH formats split, into the same chunks (2026-09-29). esbuild's splitting reorders module
    // evaluation (a shared chunk runs before its entry's own modules), and styled-components numbers
    // its component ids in creation order: an ESM build split and a CJS build not split created the
    // same 237 components in two orders, so the kit's server (CJS) and client (ESM) disagreed on
    // every class from the 119th on and hydration failed. `check.modules` renders through both.
    splitting: true,
    external: [
        /^@plurid\//,
        'react', 'react-dom', 'react/jsx-runtime',
        'styled-components', 'redux', 'react-redux', '@reduxjs/toolkit',
        'cross-fetch',
    ],
});
