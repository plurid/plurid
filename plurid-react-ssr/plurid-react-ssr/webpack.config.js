const path = require('path');
const nodeExternals = require('webpack-node-externals');



module.exports = {
    entry: './src/server/index.tsx',

    target: 'node',

    resolve: {
        extensions: ['.ts', '.tsx', '.js']
    },

    externals: [nodeExternals()],

    output: {
        path: path.resolve('build/server'),
        filename: 'index.js'
    },

    module: {
        rules: [
            {
                test: /\.tsx$/,
                use: 'babel-loader'
            }
        ]
    }
};





// const path = require('path');
// // const HtmlWebpackPlugin = require('html-webpack-plugin');


// module.exports = {
//     // webpack will take the files from ./src/index
//     entry: './src/index',

//     mode: 'development',

//     // and output it into /build as index.js
//     output: {
//         path: path.join(__dirname, '/build'),
//         filename: 'index.js'
//     },

//     "target": "node",

//     // adding .ts and .tsx to resolve.extensions will help babel look for .ts and .tsx files to transpile
//     resolve: {
//         extensions: ['.ts', '.tsx', '.js']
//     },

//     module: {
//         rules: [
//             // we use babel-loader to load our jsx and tsx files
//             {
//                 test: /\.(ts|js)x?$/,
//                 exclude: /node_modules/,
//                 use: {
//                     loader: 'babel-loader'
//                 },
//             },

//             // css-loader to bundle all the css files into one file and style-loader to add all the styles  inside the style tag of the document
//             {
//                 test: /\.css$/,
//                 use: ['style-loader', 'css-loader']
//             }
//         ]
//     },
//     // plugins: [
//     //     new HtmlWebpackPlugin({
//     //         template: './src/index.html'
//     //     })
//     // ]
// };
