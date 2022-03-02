const path = require('path');

const webpack = require('webpack');
const merge = require('webpack-merge').merge;
// const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

const {
    plugins,
    baseConfig,
} = require('./client.base');



const config = {
    mode: 'production',

    stats: {
        colors: false,
        hash: true,
        timings: true,
        assets: true,
        chunks: true,
        chunkModules: true,
        modules: true,
        children: true,
    },

    plugins: [
        // new BundleAnalyzerPlugin(),
        plugins.processEnvironmentPlugin,
        plugins.copyPlugin,
        plugins.compressionPluginBrotli,
        plugins.compressionPluginGzip,
    ],
};



module.exports = merge(baseConfig, config);
