import typescript from 'rollup-plugin-typescript2';
import commonjs from 'rollup-plugin-commonjs';
import external from 'rollup-plugin-peer-deps-external';
import postcss from 'rollup-plugin-postcss';
import resolve from 'rollup-plugin-node-resolve';
import url from 'rollup-plugin-url';
import svgr from '@svgr/rollup';
import replace from 'rollup-plugin-replace';
import babel from 'rollup-plugin-babel';

import pkg from './package.json';



export default {
    input: 'src/index.tsx',
    output: [
        {
            file: pkg.main,
            format: 'cjs',
            exports: 'named',
            sourcemap: true
        },
        // {
        //     file: pkg.module,
        //     format: 'es',
        //     exports: 'named',
        //     sourcemap: true
        // }
    ],
    plugins: [
        replace({
            'process.env.MODE_ENV': JSON.stringify(process.env.MODE_ENV),
        }),
        external(),
        postcss({
            modules: true
        }),
        url(),
        svgr(),
        babel({
            exclude: "node_modules/**"
        }),
        resolve(),
        typescript({
            rollupCommonJSResolveHack: true,
            clean: true,
        }),
        commonjs(),
    ],
}
