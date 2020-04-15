import typescript from 'rollup-plugin-typescript2';

import pkg from './package.json';



export default {
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
        typescript({
            rollupCommonJSResolveHack: true,
            clean: true,
        }),
    ],
}
