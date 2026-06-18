import { defineConfig } from 'tsup';


// Modern build (2026-06-18): tsup (esbuild) replacing rollup, matching the plurid packages.
export default defineConfig({
    entry: ['source/index.ts'],
    format: ['esm', 'cjs'],
    dts: true,
    outDir: 'distribution',
    sourcemap: true,
    clean: true,
    treeshake: false,
    external: [/^@plurid\//, 'react', 'react-dom', 'react/jsx-runtime', 'styled-components', 'redux', 'react-redux', '@reduxjs/toolkit'],
});
