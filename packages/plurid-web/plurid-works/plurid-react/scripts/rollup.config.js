import pkg from '../package.json';

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
            interop: 'auto',
            sourcemap: true,
        },
        plugins,
    },
    {
        input,
        output: {
            file: `./distribution/index.es.js`,
            format: 'es',
            exports: 'named',
            interop: 'auto',
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
            interop: 'auto',
            sourcemap: true,
        },
        plugins: [
            ...plugins,
        ],
    },
];
