module.exports = {
    resolve: {
        extensions: ['.js', '.jsx', '.json'],
    },

    module: {
        rules: [
            {
                test: /\.(png|jpe?g|gif)$/i,
                use: [
                    {
                        loader: 'file-loader',
                        options: {
                            name: '[path][name].[hash].[ext]',
                        },
                    },
                ],
            },
            {
                test: /\.js$/,
                loader: 'babel-loader',
                exclude: /node_modules/,
                options: {
                    presets: [
                        '@babel/preset-react',
                        ['@babel/env', { targets: { browsers: ['last 2 versions'] } }],
                    ],
                },
            },
        ],
    },
};
