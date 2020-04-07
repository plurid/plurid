const path = require('path');

const webpack = require('webpack');
const merge = require('webpack-merge');
const TerserPlugin = require('terser-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
// const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

const baseConfig = require('./client.base');


const entryIndex = path.resolve(__dirname, '../../source/client/index.tsx');
const outputPath = path.resolve(__dirname, '../../build');


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

    entry: {
        index: entryIndex,
    },

    output: {
        filename: '[name].js',
        path: outputPath,
    },

    plugins: [
        // new BundleAnalyzerPlugin(),
        new CopyPlugin([
            {
                from: path.resolve(__dirname, '../../source/public'),
                to: './',
            },
        ]),
        new webpack.DefinePlugin({
            'process.env': {
                NODE_ENV: JSON.stringify('production'),
            },
        }),
    ],
};


module.exports = merge(baseConfig, config);
