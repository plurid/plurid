import ttypescript from 'ttypescript';
import commonjs from '@rollup/plugin-commonjs';
import sourceMaps from 'rollup-plugin-sourcemaps';
import typescript from 'rollup-plugin-typescript2';
import cleanup from 'rollup-plugin-cleanup';

const pkg = require('../package.json');



export default {
    input: 'source/index.ts',
    output: [
        {
            file: pkg.main,
            format: 'cjs',
            sourcemap: true,
        },
        {
            file: pkg.module,
            format: 'es',
            sourcemap: true,
        },
    ],
    external: [
        '@plurid/plurid-data',
        '@plurid/plurid-functions',
        '@plurid/plurid-themes',
    ],
    watch: {
        include: 'source/**',
    },
    plugins: [
        typescript({
            typescript: ttypescript,
            rollupCommonJSResolveHack: true,
            clean: true,
        }),
        commonjs(),
        sourceMaps(),
        cleanup({
            extensions: [
                'ts',
            ],
        }),
    ],
};
