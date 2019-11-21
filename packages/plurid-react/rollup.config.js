import typescript from 'rollup-plugin-typescript2';
import commonjs from 'rollup-plugin-commonjs';
import external from 'rollup-plugin-peer-deps-external';
import postcss from 'rollup-plugin-postcss';
import resolve from 'rollup-plugin-node-resolve';
import url from 'rollup-plugin-url';
import replace from 'rollup-plugin-replace';
import babel from 'rollup-plugin-babel';

import pkg from './package.json';



export default {
    input: 'source/index.tsx',
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
    // external: [
    //     '@plurid/plurid-pubsub',
    //     '@plurid/plurid-engine',
    //     '@plurid/plurid-data',
    //     '@plurid/utilities.functions',
    //     '@plurid/utilities.themes',
    //     'redux-devtools-extension',
    // ],
    plugins: [
        replace({
            'process.env.MODE_ENV': JSON.stringify(process.env.MODE_ENV),
        }),
        external(),
        postcss({
            modules: true
        }),
        url(),
        babel({
            exclude: "node_modules/**"
        }),
        resolve({
            modulesOnly: true,
        }),
        typescript({
            rollupCommonJSResolveHack: true,
            clean: true,
        }),
        commonjs(),
    ],
}
