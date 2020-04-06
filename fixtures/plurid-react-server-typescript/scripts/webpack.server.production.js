const path = require('path');
const merge = require('webpack-merge');
const webpackNodeExternals = require('webpack-node-externals');

const baseConfig = require('./webpack.server.base.js');



const config = {
    target: 'node',

    mode: 'production',

    optimization: {
        minimize: true,
    },

    entry: './source/server/index.ts',

    externals: [webpackNodeExternals()],

    output: {
        filename: 'server.js',
        path: path.resolve(__dirname, '../build'),
        library: 'pluridServer',
        libraryTarget: 'umd',
    },
};


module.exports = merge(baseConfig, config);
