const path = require('path');

const alias = require('@rollup/plugin-alias');
const postcss = require('rollup-plugin-postcss');
const url = require('@rollup/plugin-url');
const json = require('@rollup/plugin-json');
const external = require('rollup-plugin-peer-deps-external');
const resolve = require('@rollup/plugin-node-resolve').default;
const commonjs = require('@rollup/plugin-commonjs');
const sourceMaps = require('rollup-plugin-sourcemaps');
const { terser } = require('rollup-plugin-terser');


const {
    BUILD_DIRECTORY,
    ASSETS_DIRECTORY,

    isProduction,
} = require ('./shared');



const input = 'source/server/index.js';

const output = [
    {
        file: `./${BUILD_DIRECTORY}/index.js`,
        format: 'cjs',
        exports: 'default',
    },
];


const plugins = {
    alias: () => alias({
        entries: [
            { find: '~server', replacement: './source/server' },
            { find: '~kernel-assets', replacement: './source/shared/kernel/assets' },
            { find: '~kernel-components', replacement: './source/shared/kernel/components' },
            { find: '~kernel-containers', replacement: './source/shared/kernel/containers' },
            { find: '~kernel-planes', replacement: './source/shared/kernel/planes' },
            { find: '~kernel-data', replacement: './source/shared/kernel/data' },
            { find: '~kernel-services', replacement: './source/shared/kernel/services' },
            { find: '~planes', replacement: './source/shared/planes' },
            { find: '~routes', replacement: './source/shared/routes' },
            { find: '~shell', replacement: './source/shared/shell' },
        ],
    }),
    postcss: () => postcss(),
    url: () => url({
        include: [
            '**/*.jpg', '**/*.jpeg', '**/*.png', '**/*.svg',  '**/*.gif',
            '**/*.woff', '**/*.ttf', '**/*.otf', '**/*.eof',
            '**/*.wav', '**/*.mp3',
            '**/*.pdf',
            '**/*.mov', '**/*.mp4',
        ],
        limit: 0,
        emitFiles: true,
        fileName: `client/${ASSETS_DIRECTORY}/[name][extname]`,
        sourceDir: path.join(__dirname, 'source'),
    }),
    json: () => json(),
    external: () => external({
        includeDependencies: true,
    }),
    resolve: () => resolve({
        preferBuiltins: true,
    }),
    commonjs: () => commonjs(),
    sourceMaps: () => sourceMaps(),
    terser: () => terser({
        format: {
            comments: false,
        },
    }),
};


module.exports = {
    input,
    output,
    plugins,
};
