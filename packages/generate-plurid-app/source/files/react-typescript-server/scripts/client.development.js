const path = require('path');

const merge = require('webpack-merge');
const CopyPlugin = require('copy-webpack-plugin');

const baseConfig = require('./client.base');



const config = {
    mode: 'development',

    entry: {
        index: './source/client/index.tsx',
    },

    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, '../build'),
    },

    optimization: {
        minimize: false,
        splitChunks: {
            cacheGroups: {
                commons: {
                    test: /[\\/]node_modules[\\/]/,
                    name: "vendor",
                    chunks: "initial",
                },
            },
        },
    },

    // devtool: 'inline-source-map',

    plugins: [
        new CopyPlugin([
            { from: './source/public/', to: './' },
        ]),
    ],
};


module.exports = merge(baseConfig, config);
