const path = require('path');

const merge = require('webpack-merge');
const CopyPlugin = require('copy-webpack-plugin');

const baseConfig = require('./webpack.client.base');



const config = {
    mode: 'development',

    entry: './source/client/index.tsx',

    output: {
        filename: 'index.js',
        path: path.resolve(__dirname, '../build'),
    },

    optimization: {
        minimize: false,
    },

    devtool: 'inline-source-map',

    plugins: [
        new CopyPlugin([
            { from: './source/public/', to: './' },
        ]),
    ],
};


module.exports = merge(baseConfig, config);
