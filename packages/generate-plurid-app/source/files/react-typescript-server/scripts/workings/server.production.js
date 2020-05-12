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
        plugins.typescript(),
        plugins.external(),
        plugins.resolve(),
        plugins.commonjs(),
        plugins.sourceMaps(),
    ],
}
