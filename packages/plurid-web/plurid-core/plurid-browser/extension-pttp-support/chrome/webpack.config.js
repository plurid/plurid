const webpack = require('webpack');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');



const DEVELOPMENT = 'development';
const {
    NODE_ENV = DEVELOPMENT,
} = process.env;


const base = {
    context: __dirname,
    entry: {
        background: './source/programs/background/index.ts',
        // contentscript: './source/programs/contentscript/index.tsx',
        popup: './source/programs/popup/index.tsx',
        options: './source/programs/options/index.tsx',
    },
    resolve: {
        extensions: [".ts", ".tsx", ".js", ".jsx"],
        alias: {
            crypto: false,
        },
    },
    output: {
        publicPath: '',
        path: path.join(__dirname, 'build'),
        filename: '[name].js',
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
            {
                test: /\.css$/,
                use: 'css-loader',
                exclude: /node_modules/,
            },
        ],
    },
    plugins: [
        new CopyPlugin({
            patterns: [
                { from: './source/assets', to: 'assets' },
            ],
        }),
        new HtmlWebpackPlugin({
            template: './source/programs/popup/index.html',
            chunks: ['popup'],
            filename: 'popup.html',
        }),
        new HtmlWebpackPlugin({
            template: './source/programs/options/index.html',
            chunks: ['options'],
            filename: 'options.html',
        }),
        new webpack.DefinePlugin({
            'process.env': {
                NODE_ENV: JSON.stringify(NODE_ENV),
            },
        }),
    ],
};


const development = {
    ...base,
    mode: 'development',
    devtool: 'source-map',
    module: {
        ...base.module,
    },
    plugins: [
        ...base.plugins,
        new CopyPlugin({
            patterns: [
                { from: './source/manifest.json', to: './manifest.json' },
            ],
        }),
        new webpack.HotModuleReplacementPlugin(),
    ],
};


const production = {
    ...base,
    output: {
        path: path.join(__dirname, 'distribution'),
        filename: '[name].js',
    },
    mode: 'production',
    // devtool: 'source-map',
    plugins: [
        ...base.plugins,
        new CopyPlugin({
            patterns: [
                { from: './source/manifest.json', to: './manifest.json' },
            ],
        }),
        new webpack.LoaderOptionsPlugin({
            minimize: true,
            debug: false,
        }),
    ],
}


if (NODE_ENV === DEVELOPMENT) {
    module.exports = development;
} else {
    module.exports = production;
}
