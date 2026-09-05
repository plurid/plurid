import { defineConfig } from 'tsup';

import { cjsInteropPlugin } from '../../../../scripts/tsup/cjs-interop.mjs';



// Four public entries -> four export targets:
//   index  -> @plurid/plurid-kit            (defineConfig + the config contract types)
//   server -> @plurid/plurid-kit/server     (createPluridServer)
//   client -> @plurid/plurid-kit/client     (createPluridClient)
//   cli    -> the `plurid` bin              (dev | build | start | info)
//
// `packages: 'external'` externalizes every bare import (react, the @plurid/*
// runtimes, esbuild, dotenv) - they resolve from the consumer's node_modules.
// Mirrors the engine's proven plurid-react-server tsup pattern.
export default defineConfig({
    entry: {
        index: 'source/index.ts',
        server: 'source/server/index.ts',
        client: 'source/client/index.tsx',
        'cli/index': 'source/cli/index.ts',
    },
    format: ['esm', 'cjs'],
    // styled-components / react-helmet-async are CommonJS under native Node ESM: read them
    // through the interop shim (scripts/tsup/cjs-interop.mjs), so the packed ESM entry imports.
    esbuildPlugins: [cjsInteropPlugin()],
    // tsup's own externals plugin runs BEFORE user plugins; these two must not be pre-externalized
    // or the shim never sees them (the shim marks the real module external itself).
    noExternal: ['styled-components', 'react-helmet-async'],
    dts: true,
    sourcemap: true,
    clean: true,
    treeshake: true,
    splitting: false,
    shims: false,
    outDir: 'distribution',
    target: 'node18',
    esbuildOptions(options) {
        options.packages = 'external';
    },
});
