const esbuild = require('esbuild');
const common = require('./common');

const pkg = require('../../package.json');

const {
    esmModules,
} = require('../custom');



const external = esmModules.length === 0
    ? ['./node_modules/*']
    : [
        ...Object
            .keys(pkg.dependencies)
            .filter(dependency => !esmModules.includes(dependency)),
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
