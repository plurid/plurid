const esbuild = require('esbuild');



esbuild.build({
    entryPoints: [
        'source/index.ts',
    ],
    platform: 'node',
    outdir: 'distribution',
    bundle: true,
});
