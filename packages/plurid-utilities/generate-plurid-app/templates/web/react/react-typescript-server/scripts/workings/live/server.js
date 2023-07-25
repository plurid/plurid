const esbuild = require('esbuild');

const common = require('./common');

const pkg = require('../../../package.json');

const {
    resolvedESModules: esModules,
    resolvedExternals: externals,
} = require('../logic');



const external = esModules.length === 0
    ? ['./node_modules/*']
    : [
        ...Object
            .keys(pkg.dependencies)
            .filter(dependency => !esModules.includes(dependency)),
        ...externals,
    ];



const build = async () => {
    const context = await esbuild.context({
        ...common,
        entryPoints: [
            'source/server/index.ts',
        ],
        platform: 'node',
        external,
        outdir: 'build',
    });

    context.watch();
}
build();
