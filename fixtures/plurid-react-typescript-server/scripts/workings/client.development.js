const path = require('path');

const merge = require('webpack-merge').merge;

const {
    plugins,
    baseConfig,
} = require('./client.base');



const config = {
    mode: 'development',

    optimization: {
        minimize: false,
        splitChunks: {
            cacheGroups: {
                commons: {
                    test: /[\\/]node_modules[\\/]/,
                    name: 'vendor',
                    chunks: 'initial',
                },
            },
        },
    },

    devtool: 'inline-source-map',

    stats: {
        colors: true,
        hash: false,
        version: false,
        timings: true,
        assets: true,
        chunks: false,
        modules: false,
        reasons: false,
        children: false,
        source: false,
        errors: true,
        errorDetails: false,
        warnings: false,
        publicPath: false,
    },

    plugins: [
        plugins.processEnvironmentPlugin,
        plugins.copyPlugin,
    ],
};



module.exports = merge(baseConfig, config);
