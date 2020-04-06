const rules = require('./webpack.rules');

const {
    fileRule,
    tsRule,
    babelRule,
} = rules;


module.exports = {
    resolve: {
        extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
    },

    module: {
        rules: [
            fileRule,
            tsRule,
            babelRule,
        ],
    },
};
