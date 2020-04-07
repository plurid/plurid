const resolve = require('@rollup/plugin-node-resolve');
const external = require('rollup-plugin-peer-deps-external');
const commonjs = require('@rollup/plugin-commonjs');
const sourceMaps = require('rollup-plugin-sourcemaps');
const typescript = require('rollup-plugin-typescript2');
const svg = require('rollup-plugin-svg');



const input = 'source/server/index.ts';

const output = [
    {
        file: './build/server.js',
        format: 'cjs',
    },
];

const plugins = {
    svg: () => svg(),
    typescript: () => typescript({
        tsconfig: './configurations/tsconfig.json',
    }),
    external: () => external({
        includeDependencies: true,
    }),
    resolve: () => resolve({
        preferBuiltins: true,
    }),
    commonjs: () => commonjs(),
    sourceMaps: () => sourceMaps(),
};


module.exports = {
    input,
    output,
    plugins,
}
