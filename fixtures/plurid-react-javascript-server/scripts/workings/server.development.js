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
        plugins.babel(),
        plugins.external(),
        plugins.resolve(),
        plugins.commonjs(),
        plugins.sourceMaps(),
    ],
}
