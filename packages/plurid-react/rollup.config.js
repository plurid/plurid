import {
    terser,
} from 'rollup-plugin-terser';

import pkg from './package.json';

import {
    input,
    plugins,
} from './rollup.data';



export default [
    {
        input,
        output: {
            dir: 'distribution',
            format: 'cjs',
            exports: 'named',
            sourcemap: true,
        },
        plugins,
    },
    {
        input: pkg.main,
        output: {
            file: 'distribution/index.min.js',
            format: 'cjs',
            exports: 'named',
            sourcemap: false,
        },
        plugins: [
            terser(),
        ],
    },
];
