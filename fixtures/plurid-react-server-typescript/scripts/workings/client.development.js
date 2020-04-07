const path = require('path');

const merge = require('webpack-merge');

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

    plugins: [
        plugins.copyPlugin,
    ],
};



module.exports = merge(baseConfig, config);
