const {
    input,
    output,
    plugins,
} = require('./server.base');



export default {
    input,
    output,
    plugins: [
        plugins.postcss(),
        plugins.url(),
        plugins.json(),
        plugins.external(),
        plugins.resolve(),
        plugins.babel(),
        plugins.commonjs(),
        plugins.sourceMaps(),
        plugins.terser(),
    ],
};
