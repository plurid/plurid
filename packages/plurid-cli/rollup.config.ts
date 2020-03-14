import replace from '@rollup/plugin-replace';
import resolve from '@rollup/plugin-node-resolve';
import external from 'rollup-plugin-peer-deps-external';
import commonjs from '@rollup/plugin-commonjs';
import sourceMaps from 'rollup-plugin-sourcemaps';
import typescript from 'rollup-plugin-typescript2';
import json from '@rollup/plugin-json';
import copy from 'rollup-plugin-copy';


const pkg = require('./package.json');


const globals = {
    'commander': 'program',
};


export default {
    input: `source/index.ts`,
    output: [
        {
            file: pkg.main,
            format: 'cjs',
            globals,
            sourcemap: true,
        },
        {
            file: pkg.module,
            format: 'es',
            globals,
            sourcemap: true,
        },
    ],
    external: [
        'child_process',
        'path',
        'fs',
    ],
    watch: {
        include: 'source/**',
    },
    plugins: [
        replace({
            'process.env.MODE_ENV': JSON.stringify(process.env.MODE_ENV),
        }),
        json(),
        typescript({
            useTsconfigDeclarationDir: true,
        }),
        external({
            includeDependencies: true,
        }),
        resolve({
            preferBuiltins: true,
        }),
        commonjs(),
        sourceMaps(),
        copy({
            targets: [
                { src: 'source/files/', dest: 'distribution/' },
            ],
        }),
    ],
}
