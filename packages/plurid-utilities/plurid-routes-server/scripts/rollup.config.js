// #region imports
    // #region libraries
    import external from 'rollup-plugin-peer-deps-external';
    import typescript from 'rollup-plugin-typescript2';
    import { nodeResolve } from '@rollup/plugin-node-resolve';
    import { terser } from 'rollup-plugin-terser';
    // #endregion libraries


    // #region external
    import pkg from '../package.json';
    // #endregion external
// #endregion imports



// #region module
const build = {
    input: 'source/index.ts',
    output: [
        {
            file: pkg.main,
            format: 'cjs',
            exports: 'named',
        },
        {
            file: pkg.module,
            format: 'es',
            exports: 'named',
        },
    ],
    external: [
        '@plurid/deon',
        '@plurid/plurid-functions',
        'body-parser',
        'express',
    ],
    inlineDynamicImports: true,
    plugins: [
        external(),
        nodeResolve(),
        typescript(),
        terser({
            mangle: false,
            compress: false,
            format: {
                beautify: true,
                comments: false,
            },
        }),
    ],
};
// #endregion module



// #region exports
export default build;
// #endregion exports
