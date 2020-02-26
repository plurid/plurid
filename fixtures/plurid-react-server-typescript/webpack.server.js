const path = require('path');
const merge = require('webpack-merge');
const webpackNodeExternals = require('webpack-node-externals');
const baseConfig = require('./webpack.base.js');

const config = {
    // Inform webpack that we're building a bundle
    // for nodeJS, rather than for the browser
    target: 'node',

    mode: 'production',

    // Tell webpack the root file of our
    // server application
    entry: './source/index.tsx',
    // We don't serve bundle.js for server, so we can use dynamic external imports
    externals: [webpackNodeExternals()],

    // Tell webpack where to put the output file
    // that is generated
    output: {
        filename: 'server.js',
        path: path.resolve(__dirname, 'build')
    }
};

module.exports = merge(baseConfig, config);
