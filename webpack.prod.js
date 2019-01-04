const buildFolder = 'pkg';

const path = require('path');
const webpack = require('webpack');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const WebpackShellPlugin = require('webpack-shell-plugin');


const cleanWebpack = new CleanWebpackPlugin(
    [`./${buildFolder}`]
);
const miniCssExtract = new MiniCssExtractPlugin(
    {
        filename: `styles.css`
    }
);
const webpackShell = new WebpackShellPlugin({
    onBuildEnd:['npm run test:copy']
});


const config = {
    mode: 'production',
    entry: './app.ts',
    output: {
        filename: `script.js`,
        path: path.resolve(__dirname, `${buildFolder}/`)
    },
    plugins: [
        cleanWebpack,
        miniCssExtract,
        webpackShell,
    ],
    resolve: {
        extensions: [".ts", ".tsx", ".js"]
    },
    module: {
        rules: [
            {
                test: /\.(html)$/,
                use: {
                    loader: 'html-loader'
                }
            },
            {
                test: /\.scss$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    'css-loader',
                    'postcss-loader',
                    'sass-loader'
                ],
            },
            {
                test: /\.(jpe?g|png|gif|svg)$/i,
                loader: `url-loader?name=${buildFolder}/assets/images/[name].[ext]`
            },
            {
                test: /\.(ttf|woff|woff2)$/i,
                loader: `url-loader?name=${buildFolder}/assets/fonts/[name].[ext]`
            },
            {
                test: /\.ts$/,
                exclude: /node_modules/,
                use: {
                    loader: 'awesome-typescript-loader'
                }
            }
        ]
    }
};


module.exports = config;
