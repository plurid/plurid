const esbuild = require('esbuild');
const { replace } = require('esbuild-plugin-replace');

const pkg = require('../package.json');



esbuild.build({
    entryPoints: [
        'source/index.ts',
    ],
    platform: 'node',
    outdir: 'distribution',
    bundle: true,
    plugins: [
        replace({
            '__#VERSION#__': pkg.version,
        }),
    ],
});
