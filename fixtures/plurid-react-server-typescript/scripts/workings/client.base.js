const rules = require('./client.rules');

const {
    styleRule,
    fileRule,
    tsRule,
    babelRule,
} = rules;


module.exports = {
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
            styleRule,
            fileRule,
            tsRule,
            babelRule,
        ],
    },
};
