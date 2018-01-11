var webpack = require('webpack');
const path = require('path');

var ExtractTextPlugin = require('extract-text-webpack-plugin');
var OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const Uglify = require("uglifyjs-webpack-plugin");


module.exports = {
    entry: './src/js/app.js',
    output: {
        filename: 'app.min.js',
        path: path.resolve(__dirname, 'dist/js')
    },
    module: {
        loaders: [
            {
                test: /\.(jpg|png|svg)$/,
                loader: 'file-loader',
                options: {
                  name: '../images/[name].[ext]',
                },
            },
            {
                test:/\.scss$/,
                loaders: ExtractTextPlugin.extract('css-loader!sass-loader')
            }
        ]
    },
    plugins: [
        new ExtractTextPlugin('../css/styles.min.css', {
            allChunks: true
        }),
        new OptimizeCssAssetsPlugin({
            assetNameRegExp: /\.min\.css$/g,
            cssProcessor: require('cssnano'),
            cssProcessorOptions: { discardComments: { removeAll: true } },
            canPrint: true
        })
        ,
        new Uglify({
            include: /\.min\.js$/,
            minimize: true
        })
    ],
};