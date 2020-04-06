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

    module: {
        rules: [
            styleRule,
            fileRule,
            tsRule,
            babelRule,
        ],
    },
};
