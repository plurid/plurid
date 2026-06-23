import { defineConfig } from 'tsup';



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
