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
];
