const {
    input,
    output,
    plugins,
} = require('./server.base');



export default {
    input,
    output,
    plugins: [
        plugins.svg(),
        plugins.typescript(),
        plugins.babel(),
        plugins.external(),
        plugins.resolve(),
        plugins.commonjs(),
        plugins.sourceMaps(),
    ],
}
