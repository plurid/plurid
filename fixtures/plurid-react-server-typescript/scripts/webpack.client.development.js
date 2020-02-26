const path = require('path');
const merge = require('webpack-merge');
const baseConfig = require('./webpack.base');



const config = {
    mode: 'development',
    // Tell webpack to root file of our server app
    entry: './source/client/index.tsx',

    // Tell webpack where to put output file
    output: {
        filename: 'index.js',
        path: path.resolve(__dirname, '../build')
    },
    devtool: 'inline-source-map'
};

module.exports = merge(baseConfig, config);
