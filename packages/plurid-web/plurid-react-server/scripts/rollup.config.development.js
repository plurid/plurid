// #region imports
    // #region libraries
    import external from 'rollup-plugin-peer-deps-external';
    import typescript from 'rollup-plugin-typescript2';
    import { nodeResolve } from '@rollup/plugin-node-resolve';
    // #endregion libraries


    // #region external
    import pkg from '../package.json';
    // #endregion external
// #endregion imports



// #region exports
export default [
    {
        input: 'source/index.ts',
        output: [
            {
                file: pkg.main,
                format: 'cjs',
                exports: 'named',
                sourcemap: true
            },
            {
                file: pkg.module,
                format: 'es',
                exports: 'named',
                sourcemap: true
            }
        ],
        external: [
            'detect-port',
            'express',
            'open',
            'compression',
            'react-stripe-elements',
            'graphql-tag',
            'fast-json-stable-stringify',
            'zen-observable',
        ],
        inlineDynamicImports: true,
        plugins: [
            external(),
            nodeResolve(),
            typescript({
                rollupCommonJSResolveHack: true,
                clean: true,
            }),
        ],
    },
];
// #endregion exports
