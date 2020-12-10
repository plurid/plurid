import copy from 'rollup-plugin-copy';
import json from '@rollup/plugin-json';
import typescript from 'rollup-plugin-typescript2';

import pkg from '../package.json';



const globals = {
};

export default {
    input: 'source/index.ts',
    external: [
        'path',
        'fs',
        'child_process',
        'commander',
        'inquirer',
        'ora',
    ],
    output: [
        {
            file: pkg.main,
            format: 'cjs',
            globals,
            sourcemap: true,
            exports: 'named',
        },
        {
            file: pkg.module,
            format: 'es',
            globals,
            sourcemap: true,
            exports: 'named',
        },
    ],
    plugins: [
        json(),
        typescript({
            rollupCommonJSResolveHack: true,
            clean: true,
        }),
        copy({
            targets: [
                { src: 'templates/', dest: 'distribution/' },
            ],
        }),
    ],
};
