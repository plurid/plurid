// #region imports
    // #region libraries
    import ttypescript from 'ttypescript';
    import typescript from 'rollup-plugin-typescript2';
    // #endregion libraries


    // #region external
    import pkg from '../package.json';
    // #endregion external
// #endregion imports



// #region module
const globals = {
};

const build =  {
    input: 'source/index.ts',
    external: [
        'react',
    ],
    output: [
        {
            file: pkg.main,
            format: 'cjs',
            exports: 'named',
            globals,
            sourcemap: true,
        },
        {
            file: pkg.module,
            format: 'es',
            exports: 'named',
            globals,
            sourcemap: true,
        },
    ],
    plugins: [
        typescript({
            typescript: ttypescript,
            useTsconfigDeclarationDir: true,
        }),
    ],
};
// #endregion module



// #region exports
export default build;
// #endregion exports
