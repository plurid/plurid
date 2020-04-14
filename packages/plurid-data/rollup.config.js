import plugins from '../rollup.plugins';

import pkg from './package.json';



export default {
    input: 'source/index.ts',
    output: [
        {
            file: pkg.main,
            format: 'cjs',
            sourcemap: true,
            exports: 'named',
        },
        {
            file: pkg.module,
            format: 'es',
            sourcemap: true,
            exports: 'named',
        },
    ],
    plugins: [
        ...plugins,
    ],
}




// import typescript from 'rollup-plugin-typescript2';

// import pkg from './package.json';



// export default {
//     input: 'source/index.ts',
//     output: [
//         {
//             file: pkg.main,
//             format: 'cjs',
//             exports: 'named',
//             sourcemap: true
//         },
//         {
//             file: pkg.module,
//             format: 'es',
//             exports: 'named',
//             sourcemap: true
//         }
//     ],
//     plugins: [
//         typescript({
//             rollupCommonJSResolveHack: true,
//             clean: true,
//         }),
//     ],
// }
