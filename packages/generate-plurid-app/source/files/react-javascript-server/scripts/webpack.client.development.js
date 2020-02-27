const path = require('path');
const merge = require('webpack-merge');

const baseConfig = require('./webpack.base');



const config = {
    mode: 'development',

    entry: './source/client/index.tsx',

    output: {
        filename: 'index.js',
        path: path.resolve(__dirname, '../build'),
    },

    devtool: 'inline-source-map',
};


module.exports = merge(baseConfig, config);
