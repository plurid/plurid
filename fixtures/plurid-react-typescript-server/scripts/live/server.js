const esbuild = require('esbuild');
const common = require('./common');

const pkg = require('../../package.json');

const {
    esModules,
} = require('../custom');



const external = esModules.length === 0
    ? ['./node_modules/*']
    : [
        ...Object
            .keys(pkg.dependencies)
            .filter(dependency => !esModules.includes(dependency)),
    ];


esbuild.build({
    entryPoints: [
        'source/server/index.ts',
    ],
    platform: 'node',
    external,
    outdir: 'build',
    ...common,
});
