const esbuild = require('esbuild');

const common = require('./common');



const build = async () => {
    const context = await esbuild.context({
        ...common,
        entryPoints: [
            'source/client/index.tsx',
        ],
        outdir: 'build/client',
        define: {
            'process.env.ENV_MODE': JSON.stringify(process.env.ENV_MODE),
            'process.env.SC_DISABLE_SPEEDY': JSON.stringify(true), /** HACK: styled components not rendering in production */
            'process.env.PLURID_LIVE_SERVER': JSON.stringify(''),
            global: 'window',
        },
    });

    context.watch();
}
build();
