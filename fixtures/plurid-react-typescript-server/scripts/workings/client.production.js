const path = require('path');

const webpack = require('webpack');
const merge = require('webpack-merge').merge;
const TerserPlugin = require('terser-webpack-plugin');
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

    devtool: '',

    optimization: {
        splitChunks: {
            cacheGroups: {
                commons: {
                    test: /[\\/]node_modules[\\/]/,
                    name: 'vendor',
                    chunks: 'initial',
                },
            },
        },
        minimize: true,
        minimizer: [
            new TerserPlugin({
                test: /\.js(\?.*)?$/i,
                sourceMap: true,
                terserOptions: {
                    output: {
                        comments: false,
                    },
                },
                extractComments: false,
            }),
        ],
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
