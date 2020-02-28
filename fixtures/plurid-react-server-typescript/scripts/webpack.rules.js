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
            ['@babel/env', { targets: { browsers: ['last 2 versions'] } }],
        ],
    },
};


module.exports = {
    styleRule,
    fileRule,
    tsRule,
    babelRule,
}
