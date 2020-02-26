import replace from '@rollup/plugin-replace';
import external from 'rollup-plugin-peer-deps-external';
import postcss from 'rollup-plugin-postcss';
import url from '@rollup/plugin-url';
import babel from 'rollup-plugin-babel';
import typescript from 'rollup-plugin-typescript2';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import minify from 'rollup-plugin-babel-minify';

import pkg from './package.json';



export default [
    {
        input: 'source/index.ts',
        output: [
            {
                file: pkg.main,
                format: 'cjs',
                exports: 'named',
                sourcemap: true
            },
            {
                file: pkg.module,
                format: 'es',
                exports: 'named',
                sourcemap: true
            }
        ],
        plugins: [
            replace({
                'process.env.MODE_ENV': JSON.stringify(process.env.MODE_ENV),
            }),
            external(),
            postcss({
                modules: true,
            }),
            url(),
            babel({
                exclude: 'node_modules/**',
            }),
            typescript({
                rollupCommonJSResolveHack: true,
                clean: true,
            }),
            commonjs(),
            resolve({
                modulesOnly: true,
            }),
        ],
    },
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
            minify({
                /**
                 * HACK: avoids the bug:
                 * Cannot read property 'add' of undefined
                 * https://github.com/babel/minify/issues/556
                 */
                mangle: false,
            }),
        ],
    }
];
