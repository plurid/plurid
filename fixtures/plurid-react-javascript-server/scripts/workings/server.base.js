const path = require('path');

const postcss = require('rollup-plugin-postcss');
const url = require('@rollup/plugin-url');
const babel = require('@rollup/plugin-babel').default;
const external = require('rollup-plugin-peer-deps-external');
const resolve = require('@rollup/plugin-node-resolve').default;
const commonjs = require('@rollup/plugin-commonjs');
const sourceMaps = require('rollup-plugin-sourcemaps');



const BUILD_DIRECTORY = process.env.PLURID_BUILD_DIRECTORY || 'build';

const isProduction = process.env.ENV_MODE === 'production';

const input = 'source/server/index.js';

const output = [
    {
        file: `./${BUILD_DIRECTORY}/index.js`,
        format: 'cjs',
    },
];


const plugins = {
    postcss: () => postcss(),
    url: () => url({
        include: [
            '**/*.jpg', '**/*.jpeg', '**/*.png', '**/*.svg', '**/*.gif',
            '**/*.woff', '**/*.ttf', '**/*.eof', '**/*.otf',
            '**/*.wav', '**/*.mp3',
            '**/*.pdf',
            '**/*.mov', '**/*.mp4',
        ],
        limit: 0,
        emitFiles: true,
        fileName: 'client/assets/[name][extname]',
        sourceDir: path.join(__dirname, 'source'),
    }),
    babel: () => babel({
        exclude: 'node_modules/**',
        configFile: './configurations/babel.config.json',
        babelHelpers: 'bundled',
    }),
    external: () => external({
        includeDependencies: true,
    }),
    resolve: () => resolve({
        extensions: ['.jsx', '.js'],
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
