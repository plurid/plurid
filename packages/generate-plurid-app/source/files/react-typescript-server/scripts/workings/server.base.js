const svg = require('rollup-plugin-svg');
const typescript = require('rollup-plugin-typescript2');
const babel = require('rollup-plugin-babel');
const external = require('rollup-plugin-peer-deps-external');
const resolve = require('@rollup/plugin-node-resolve');
const commonjs = require('@rollup/plugin-commonjs');
const sourceMaps = require('rollup-plugin-sourcemaps');



const BUILD_DIRECTORY = process.env.PLURID_BUILD_DIRECTORY || 'build';

const input = 'source/server/index.ts';

const output = [
    {
        file: `./${BUILD_DIRECTORY}/server.js`,
        format: 'cjs',
    },
];

const plugins = {
    svg: () => svg(),
    typescript: () => typescript({
        tsconfig: './tsconfig.json',
    }),
    babel: () => babel({
        plugins: [
            [
                'babel-plugin-styled-components',
                {
                    "ssr": true,
                },
            ],
        ],
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
