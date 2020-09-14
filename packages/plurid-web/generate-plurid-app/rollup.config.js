import copy from 'rollup-plugin-copy';
import json from '@rollup/plugin-json';
import typescript from 'rollup-plugin-typescript2';

import pkg from './package.json';



const globals = {
    'commander': 'program',
    'inquirer': 'inquirer',
};

export default {
    input: 'source/index.ts',
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
    external: [
        'child_process',
        'path',
        'fs',
    ],
    plugins: [
        json(),
        typescript({
            rollupCommonJSResolveHack: true,
            clean: true,
        }),
        copy({
            targets: [
                { src: 'source/files/', dest: 'distribution/' },
            ],
        }),
    ],
}
