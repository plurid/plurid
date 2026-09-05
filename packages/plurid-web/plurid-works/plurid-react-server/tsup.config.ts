import { defineConfig } from 'tsup';

import { cjsInteropPlugin } from '../../../../scripts/tsup/cjs-interop.mjs';


// Modern build (2026-06-17): tsup (esbuild) replacing rollup + ttypescript.
// Node SSR library → dual ESM/CJS + dts, Node platform. Runtime deps (express,
// compression, …) and @plurid/react peers are auto-externalized by tsup.
export default defineConfig({
    entry: ['source/index.ts'],
    format: ['esm', 'cjs'],
    // styled-components is CommonJS under native Node ESM: read it through the interop shim
    // (scripts/tsup/cjs-interop.mjs), so the packed ESM entry imports.
    esbuildPlugins: [cjsInteropPlugin()],
    // tsup's own externals plugin runs BEFORE user plugins; the module must not be pre-externalized
    // or the shim never sees it (the shim marks the real module external itself).
    noExternal: ['styled-components'],
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
        'styled-components', 'redux', 'react-redux',
        'cross-fetch',
    ],
});
