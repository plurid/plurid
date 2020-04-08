const path = require('path');

const CopyPlugin = require('copy-webpack-plugin');



/** CONSTANTS */
const BUILD_DIRECTORY = process.env.PLURID_BUILD_DIRECTORY || 'build';

const entryIndex = path.resolve(__dirname, '../../source/client/index.tsx');
const outputPath = path.resolve(__dirname, `../../${BUILD_DIRECTORY}`);



/** PLUGINS */
const copyPlugin = new CopyPlugin([
    {
        from: path.resolve(__dirname, '../../source/public'),
        to: './',
    },
]);


const plugins = {
    copyPlugin,
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
    test: /\.(jpe?g|gif|png|svg|woff|ttf|wav|mp3|.pdf)$/i,
    use: [
        {
            loader: 'file-loader',
            options: {
                name: '[path][name].[hash].[ext]',
            },
        },
    ],
};


const tsRule = {
    test: /\.ts(x?)$/,
    exclude: /node_modules/,
    use: [
        {
            loader: 'ts-loader',
            options: {
                configFile: path.resolve(__dirname, '../../tsconfig.json'),
            },
        },
    ],
};


const babelRule = {
    test: /\.js$/,
    loader: 'babel-loader',
    exclude: /node_modules/,
    options: {
        presets: [
            '@babel/preset-react',
            [
                '@babel/env',
                {
                    targets: {
                        browsers: ['last 2 versions'],
                    },
                },
            ],
        ],
        plugins: [
            [
                'babel-plugin-styled-components',
                {
                    "ssr": true,
                },
            ],
        ],
    },
};


const rules = {
    styleRule,
    fileRule,
    tsRule,
    babelRule,
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
        extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
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
            rules.tsRule,
            rules.babelRule,
        ],
    },
};



module.exports = {
    plugins,
    rules,
    baseConfig,
};
