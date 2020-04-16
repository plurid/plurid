import replace from '@rollup/plugin-replace';
import external from 'rollup-plugin-peer-deps-external';
import postcss from 'rollup-plugin-postcss';
import url from '@rollup/plugin-url';
import babel from 'rollup-plugin-babel';
import typescript from '@rollup/plugin-typescript';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import { terser } from "rollup-plugin-terser";

import pkg from './package.json';



const input = 'source/index.tsx';
const plugins = [
    replace({
        'process.env.ENV_MODE': JSON.stringify(process.env.ENV_MODE),
    }),
    external(),
    postcss({
        modules: true,
    }),
    url(),
    babel({
        exclude: 'node_modules/**',
    }),
    typescript(),
    commonjs(),
    resolve({
        modulesOnly: true,
    }),
];


export default [
    {
        input,
        output: {
            file: pkg.main,
            format: 'cjs',
            exports: 'named',
            sourcemap: true
        },
        plugins,
    },
    // {
    //     input,
    //     plugins: [
    //         replace({
    //             'process.env.ENV_MODE': JSON.stringify(process.env.ENV_MODE),
    //         }),
    //         external(),
    //         postcss({
    //             modules: true,
    //         }),
    //         url(),
    //         babel({
    //             exclude: 'node_modules/**',
    //         }),
    //         typescript({
    //             declaration: true,
    //             declarationDir: 'distribution',
    //         }),
    //         commonjs(),
    //         resolve({
    //             modulesOnly: true,
    //         }),
	// 	],
	// 	output: [
	// 		{
    //             dir: 'distribution',
    //             format: 'es',
    //         }
	// 	],
    // },
    {
        input: pkg.main,
        output: [
            {
                file: 'distribution/index.min.js',
                format: 'cjs',
                exports: 'named',
                sourcemap: true
            },
        ],
        plugins: [
            terser(),
        ],
    }
];
