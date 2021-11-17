import replace from '@rollup/plugin-replace';
import external from 'rollup-plugin-peer-deps-external';
import postcss from 'rollup-plugin-postcss';
import url from '@rollup/plugin-url';
// import {
//     getBabelOutputPlugin,
// } from '@rollup/plugin-babel';
import ttypescript from 'ttypescript';
import typescript from '@rollup/plugin-typescript';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import {
    terser,
} from 'rollup-plugin-terser';



export const input = 'source/index.tsx';

export const plugins = [
    typescript({
        typescript: ttypescript,
        tsconfig: './tsconfig.json',
    }),
    replace({
        'process.env.ENV_MODE': JSON.stringify(process.env.ENV_MODE),
        preventAssignment: true,
    }),
    external(),
    postcss({
        modules: true,
    }),
    url(),
    commonjs(),
    resolve({
        modulesOnly: true,
    }),
    // getBabelOutputPlugin({
    //     plugins: [
    //         [
    //             'babel-plugin-styled-components',
    //             {
    //                 namespace: 'plurid',
    //                 displayName: false,
    //                 fileName: false,
    //             },
    //         ],
    //     ],
    // }),
    terser({
        mangle: false,
        compress: false,
        format: {
            beautify: true,
            comments: false,
        },
    }),
];
