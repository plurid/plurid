const {
    input,
    output,
    plugins,
} = require('./server.base');



export default {
    input,
    output,
    plugins: [
        plugins.alias(),
        plugins.postcss(),
        plugins.url(),
        plugins.json(),
        plugins.external(),
        plugins.resolve(),
        plugins.commonjs(),
        plugins.sourceMaps(),
        plugins.terser(),
    ],
};
