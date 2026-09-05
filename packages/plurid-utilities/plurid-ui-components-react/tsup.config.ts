import { defineConfig } from 'tsup';

import { cjsInteropPlugin } from '../../../scripts/tsup/cjs-interop.mjs';


// Modern build (2026-06-18): tsup (esbuild) replacing rollup, matching the plurid packages.
export default defineConfig({
    entry: ['source/index.ts'],
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
    treeshake: false,
    external: [/^@plurid\//, 'react', 'react-dom', 'react/jsx-runtime', 'styled-components', 'redux', 'react-redux', '@reduxjs/toolkit'],
});
