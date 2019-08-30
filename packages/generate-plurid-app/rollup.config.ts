import resolve from 'rollup-plugin-node-resolve';
// import builtins from 'rollup-plugin-node-builtins';
// import globals from 'rollup-plugin-node-globals';
import external from 'rollup-plugin-peer-deps-external';
import commonjs from 'rollup-plugin-commonjs';
import sourceMaps from 'rollup-plugin-sourcemaps';
import camelCase from 'lodash.camelcase';
import typescript from 'rollup-plugin-typescript2';
import json from 'rollup-plugin-json';



const pkg = require('./package.json');

const libraryName = 'generate-plurid-app';

const globals = {
};


export default {
    input: `src/index.ts`,
    output: [
        {
            file: pkg.main,
            name: camelCase(libraryName),
            format: 'umd',
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
    // Indicate here external modules you don't wanna include in your bundle (i.e.: 'lodash')
    external: [],
    watch: {
        include: 'src/**',
    },
    plugins: [
        // Allow json resolution
        json(),

        // Compile TypeScript files
        typescript({
            useTsconfigDeclarationDir: true
        }),

        external({
            includeDependencies: true,
        }),

        // Allow node_modules resolution, so you can use 'external' to control
        // which external modules to include in the bundle
        // https://github.com/rollup/rollup-plugin-node-resolve#usage
        resolve({
            preferBuiltins: true,
        }),

        // Allow bundling cjs modules (unlike webpack, rollup doesn't understand cjs)
        commonjs(),

        // globals(),
        // builtins(),

        // Resolve source maps to the original source
        sourceMaps(),
    ],
}
