// #region imports
    // #region libraries
    import external from 'rollup-plugin-peer-deps-external';
    import typescript from 'rollup-plugin-typescript2';
    import { nodeResolve } from '@rollup/plugin-node-resolve';
    // #endregion libraries


    // #region external
    import pkg from '../package.json';
    // #endregion external


    // #region internal
    import {
        input,
        external as externalPackages,
    } from './rollup.data';
    // #endregion internal
// #endregion imports



// #region module
const build = {
    input,
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
    external: externalPackages,
    inlineDynamicImports: true,
    plugins: [
        external(),
        nodeResolve(),
        typescript(),
    ],
};
// #endregion module



// #region exports
export default build;
// #endregion exports
