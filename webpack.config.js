var webpack = require('webpack');
const path = require('path');

var ExtractTextPlugin = require('extract-text-webpack-plugin');
var OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');


module.exports = {
    entry: './src/js/app.js',
    output: {
        filename: 'app.min.js',
        path: path.resolve(__dirname, 'dist/js')
    },
    module: {
        loaders: [
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
        }),
        new webpack.optimize.UglifyJsPlugin({
            include: /\.min\.js$/,
            minimize: true
        })
    ]
};