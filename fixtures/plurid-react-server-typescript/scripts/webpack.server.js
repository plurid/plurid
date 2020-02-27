const path = require('path');
const merge = require('webpack-merge');
const webpackNodeExternals = require('webpack-node-externals');

const baseConfig = require('./webpack.base.js');



const config = {
    target: 'node',

    mode: 'production',

    // optimization: {
    //     minimize: false,
    // },

    entry: './source/server/index.ts',

    externals: [webpackNodeExternals()],

    output: {
        filename: 'server.js',
        path: path.resolve(__dirname, '../build'),
    },
};


module.exports = merge(baseConfig, config);
