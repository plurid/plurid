const esbuild = require('esbuild');



esbuild.build({
    entryPoints: [
        'source/index.tsx',
    ],
    outdir: 'distribution',
    define: {
        // 'process.env.ENV_MODE': JSON.stringify(process.env.ENV_MODE),
        'process.env.ENV_MODE': JSON.stringify('local'),
        global: 'window',
    },
    bundle: true,
    format: 'cjs',
    assetNames: 'assets/[name]',
    loader: {
        '.ttf': 'file',
        '.png': 'file',
        '.jpg': 'file',
        '.jpeg': 'file',
        '.svg': 'file',
        '.gif': 'file',
        '.mov': 'file',
    },
    external: [
        '@plurid/elementql',
        '@plurid/elementql-client-react',
        '@plurid/plurid-data',
        '@plurid/plurid-engine',
        '@plurid/plurid-functions',
        '@plurid/plurid-functions-react',
        '@plurid/plurid-icons-react',
        '@plurid/plurid-pubsub',
        '@plurid/plurid-themes',
        '@plurid/plurid-ui-components-react',
        '@plurid/plurid-ui-state-react',
        'cross-fetch',
        'hammerjs',
        'react',
        'react-dom',
        'react-redux',
        'redux',
        'redux-thunk',
        'styled-components',
        'immer',
    ],
    watch: {
        onRebuild(error, result) {
            if (error) console.error('watch build failed:', error)
            else console.log('watch build succeeded')
        },
    },
});
