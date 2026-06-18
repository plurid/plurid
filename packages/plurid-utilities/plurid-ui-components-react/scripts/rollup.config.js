// #region imports
    // #region libraries
    import typescript from 'rollup-plugin-typescript2';
    import terser from '@rollup/plugin-terser';
    // #endregion libraries


    // #region internal
    import pkg from '../package.json';
    // #endregion internal
// #endregion imports



// #region module
const build = {
    input: 'source/index.ts',
    external: [
        '@plurid/plurid-functions',
        '@plurid/plurid-functions-react',
        '@plurid/plurid-icons-react',
        '@plurid/plurid-themes',
        '@plurid/plurid-ui-state-react',
        '@reduxjs/toolkit',
        'react',
        'react-dom',
        'react-redux',
        'styled-components',
        'immer',
    ],
    output: [
        {
            file: pkg.main,
            format: 'cjs',
            exports: 'named',
            sourcemap: true,
            interop: 'auto',
        },
        {
            file: pkg.module,
            format: 'es',
            exports: 'named',
            sourcemap: true,
            interop: 'auto',
        },
    ],
    plugins: [
        typescript({
            clean: true,
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
