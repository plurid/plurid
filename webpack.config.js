const ExtractTextPlugin = require("extract-text-webpack-plugin");

const extractSass = new ExtractTextPlugin({
    filename: "../css/plurid.min.css",
    disable: process.env.NODE_ENV === "development"
});


const path = require('path');

module.exports = {
    mode: 'development',
    // mode: 'production',
    entry: './src/js/app.js',
    output: {
        filename: 'plurid.min.js',
        path: path.resolve(__dirname, 'dist/js')
    },
    module: {
        rules: [{
            test: /\.scss$/,
            use: extractSass.extract({
                use: [{
                    loader: "css-loader"
                }, {
                    loader: "sass-loader"
                }],
                // use style-loader in development
                fallback: "style-loader"
            })
        }]
    },
    plugins: [
        extractSass
    ]
};
