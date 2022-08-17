const esbuild = require('esbuild');
const common = require('./common');



esbuild.build({
    entryPoints: [
        'source/server/index.js',
    ],
    platform: 'node',
    external: ['./node_modules/*'],
    outdir: 'build',
    ...common,
});
