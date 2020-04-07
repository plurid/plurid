const path = require('path');

const merge = require('webpack-merge');
const CopyPlugin = require('copy-webpack-plugin');

const baseConfig = require('./client.base');


const entryIndex = path.resolve(__dirname, '../../source/client/index.tsx');
const outputPath = path.resolve(__dirname, '../../build');


const config = {
    mode: 'development',

    entry: {
        index: entryIndex,
    },

    output: {
        filename: '[name].js',
        path: outputPath,
    },

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

    // devtool: 'inline-source-map',

    plugins: [
        new CopyPlugin([
            {
                from: path.resolve(__dirname, '../../source/public'),
                to: './',
            },
        ]),
    ],
};


module.exports = merge(baseConfig, config);
