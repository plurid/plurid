const path = require('path');

const webpack = require('webpack');
const CopyPlugin = require('copy-webpack-plugin');
const CompressionPlugin = require('compression-webpack-plugin');


const {
    BUILD_DIRECTORY,
    ASSETS_DIRECTORY,

    isProduction,
} = require ('./shared');



/** CONSTANTS */
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
    include: /vendor.js$/,
    // filename: 'vendor.js.gzip',
});

const processEnvironmentPlugin = new webpack.DefinePlugin({
    'process.env.ENV_MODE': JSON.stringify(process.env.ENV_MODE),
    'process.env.SC_DISABLE_SPEEDY': true, /** HACK: styled components not rendering in production */
    'process.env.PLURID_LIVE_SERVER': JSON.stringify(''),
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
    test: /\.(jpe?g|gif|png|svg|eof|otf|woff|ttf|wav|mp3|pdf|mov|mp4)$/i,
    type: 'asset/resource',
    generator: {
        filename: `${ASSETS_DIRECTORY}/[name][ext]`,
    },
};


const jsxRule = {
    test: /\.(js|jsx)$/,
    exclude: /node_modules/,
    use: [{
        loader: 'babel-loader',
        options: {
            presets: [
                [
                    '@babel/preset-env',
                    {
                        'targets': 'defaults',
                    },
                ],
                '@babel/preset-react',
            ],
        },
    }],
};


const rules = {
    styleRule,
    fileRule,
    jsxRule,
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

        alias: {
            crypto: false,
        },
    },

    stats: {
        modules: false,
        chunks: false,
        assets: false,
    },

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
    },

    module: {
        rules: [
            rules.styleRule,
            rules.fileRule,
            rules.jsxRule,
        ],
    },
};



module.exports = {
    plugins,
    rules,
    baseConfig,
};
