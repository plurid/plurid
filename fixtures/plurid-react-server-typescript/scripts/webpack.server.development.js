const path = require('path');
const merge = require('webpack-merge');
const webpackNodeExternals = require('webpack-node-externals');

const baseConfig = require('./webpack.server.base.js');



const config = {
    target: 'node',

    mode: 'development',

    optimization: {
        minimize: false,
    },

    entry: './source/server/index.ts',

    externals: [webpackNodeExternals()],

    output: {
        filename: 'server.js',
        path: path.resolve(__dirname, '../build'),
        // library: 'pluridServer',
        // libraryTarget: 'commonjs2',
    },
};


module.exports = merge(baseConfig, config);
