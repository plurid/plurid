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
        plugins.postcss(),
        plugins.image(),
        plugins.url(),
        plugins.typescript(),
        plugins.babel(),
        plugins.external(),
        plugins.resolve(),
        plugins.commonjs(),
        plugins.sourceMaps(),
    ],
}
