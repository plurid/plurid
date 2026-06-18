// #region imports
    // #region libraries
    import external from 'rollup-plugin-peer-deps-external';
    import typescript from 'rollup-plugin-typescript2';
    import terser from '@rollup/plugin-terser';
    // #endregion libraries


    // #region external
    import pkg from '../package.json';
    // #endregion external
// #endregion imports



// #region module
const globals = {};

const build =  {
    input: `source/index.ts`,
    output: [
        {
            file: pkg.main,
            format: 'cjs',
            globals,
            sourcemap: true,
            interop: 'auto',
        },
        {
            file: pkg.module,
            format: 'es',
            globals,
            sourcemap: true,
            interop: 'auto',
        },
    ],
    external: [
        '@plurid/plurid-themes',
        'react',
        'react-dom',
        'styled-components',
    ],
    plugins: [
        typescript({
            useTsconfigDeclarationDir: true,
        }),
        external({
            includeDependencies: true,
        }),
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
