const path = require('path');

const webpack = require('webpack');
const CopyPlugin = require('copy-webpack-plugin');
const CompressionPlugin = require('compression-webpack-plugin');



/** CONSTANTS */
const BUILD_DIRECTORY = process.env.PLURID_BUILD_DIRECTORY || 'build';

const isProduction = process.env.ENV_MODE === 'production';

const entryIndex = path.resolve(__dirname, '../../source/client/index.jsx');
const outputPath = path.resolve(__dirname, `../../${BUILD_DIRECTORY}/client`);


/** PLUGINS */
const copyPlugin = new CopyPlugin({
    patterns: [
        {
            from: path.resolve(__dirname, '../../source/public'),
            to: './',
        },
    ],
});

const compressionPluginBrotli = new CompressionPlugin({
    include: 'vendor.js',
    filename: 'vendor.js.br',
    algorithm: 'brotliCompress',
    compressionOptions: { level: 11 },
    threshold: 10240,
    minRatio: 0.8,
    deleteOriginalAssets: false,
});
const compressionPluginGzip = new CompressionPlugin({
    include: 'vendor.js',
    filename: 'vendor.js.gzip',
});

const processEnvironmentPlugin = new webpack.DefinePlugin({
    'process.env.ENV_MODE': JSON.stringify(process.env.ENV_MODE),
    'process.env.SC_DISABLE_SPEEDY': true, /** HACK: styled components not rendering in production */
});


const plugins = {
    copyPlugin,
    compressionPluginBrotli,
    compressionPluginGzip,
    processEnvironmentPlugin,
};



/** RULES */
const styleRule = {
    test: /\.css$/,
    use: [
        'style-loader',
        'css-loader',
    ],
};


const fileRule = {
    test: /\.(jpe?g|gif|png|svg|woff|ttf|wav|mp3|pdf|mov|mp4)$/i,
    use: [
        {
            loader: 'file-loader',
            options: {
                name: '/assets/[name].[ext]',
            },
        },
    ],
};


const rules = {
    styleRule,
    fileRule,
};



/** CONFIGURATION */
const baseConfig = {
    entry: {
        index: entryIndex,
    },

    output: {
        filename: '[name].js',
        path: outputPath,
    },

    resolve: {
        extensions: ['.js', '.jsx', '.json'],
    },

    stats: {
        modules: false,
        chunks: false,
        assets: false,
    },

    module: {
        rules: [
            rules.styleRule,
            rules.fileRule,
        ],
    },
};



module.exports = {
    plugins,
    rules,
    baseConfig,
};
