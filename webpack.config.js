const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");
const UglifyJsPlugin = require("uglifyjs-webpack-plugin");


const miniCssExtract = new MiniCssExtractPlugin({
    filename: "../css/plurid.css",
    disable: process.env.NODE_ENV === "development"
});
const path = require('path');


module.exports = {
    mode: 'development',
    // mode: 'production',
    entry: './app.js',
    output: {
        filename: 'plurid.js',
        path: path.resolve(__dirname, 'plurid/js')
    },
    optimization: {
        minimizer: [
            new UglifyJsPlugin({
                cache: true,
                parallel: true,
                sourceMap: true
            }),
            new OptimizeCSSAssetsPlugin({})
        ]
    },
    plugins: [
        miniCssExtract
    ],
    module: {
        rules: [
            {
                test: /\.scss$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    'css-loader',
                    'sass-loader',
                ],
            },
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: "babel-loader"
                }
            }
        ]
    }
};
