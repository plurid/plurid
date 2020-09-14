import commonjs from '@rollup/plugin-commonjs';
import sourceMaps from 'rollup-plugin-sourcemaps';
import camelCase from 'lodash.camelcase';
import typescript from 'rollup-plugin-typescript2';



const pkg = require('./package.json');
const libraryName = 'plurid-engine';
const globals = {
    '@plurid/plurid-data': 'pluridData',
    '@plurid/plurid-functions': 'pluridFunctions',
};

export default {
    input: 'source/index.ts',
    output: [
        {
            file: pkg.main,
            name: camelCase(libraryName),
            format: 'umd',
            sourcemap: true,
            globals,
        },
        {
            file: pkg.module,
            format: 'es',
            sourcemap: true,
            globals,
        },
    ],
    external: [
        '@plurid/plurid-data',
        '@plurid/plurid-functions',
    ],
    watch: {
        include: 'source/**',
    },
    plugins: [
        typescript({
            rollupCommonJSResolveHack: true,
            clean: true,
        }),
        commonjs(),
        sourceMaps(),
    ],
}
