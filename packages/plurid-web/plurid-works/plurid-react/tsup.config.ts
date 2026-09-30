import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

import { defineConfig } from 'tsup';

import { cjsInteropPlugin } from '../../../../scripts/tsup/cjs-interop.mjs';


/**
 * THE ADAPTER IS CLIENT CODE (2026-09-29): hooks, context, the DOM. A React Server Components bundler
 * (Next's App Router) evaluates an unmarked module on the server and fails ("Named export 'useEffect'
 * not found"); `'use client'` first in every emitted file, entries and chunks, of both formats makes the
 * package a client boundary. Node and the other bundlers read it as the expression statement it is.
 *
 * Written after the build: esbuild's `banner` does not survive tsup's tree-shaking pass (rollup drops
 * module-level directives: "Module level directives cause errors when bundled … was ignored"). Each
 * sourcemap is shifted by the one line the directive adds.
 */
const USE_CLIENT = '\'use client\';';

const markClientFiles = async (
    directory: string,
) => {
    for (const name of await readdir(directory)) {
        if (!/\.m?js$/.test(name)) {
            continue;
        }
        const file = join(directory, name);
        const code = await readFile(file, 'utf8');
        if (code.startsWith(USE_CLIENT)) {
            continue;
        }
        await writeFile(file, USE_CLIENT + '\n' + code);

        const mapFile = file + '.map';
        const map = JSON.parse(await readFile(mapFile, 'utf8').catch(() => 'null'));
        if (map && typeof map.mappings === 'string') {
            map.mappings = ';' + map.mappings;
            await writeFile(mapFile, JSON.stringify(map));
        }
    }
};


// Modern build (2026-06-17): tsup (esbuild) replacing rollup + ttypescript + terser.
// React JSX + dual ESM/CJS + dts. All @plurid siblings and the React/redux/styled
// ecosystem are peers → kept external (not bundled).
export default defineConfig({
    entry: {
        index: 'source/index.tsx',
        testing: 'source/testing/index.tsx',
        agent: 'source/agent/index.ts',
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
    async onSuccess() {
        await markClientFiles('distribution');
    },
});
