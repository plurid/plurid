import typescript from 'rollup-plugin-typescript2';
import commonjs from '@rollup/plugin-commonjs';
import depsExternal from 'rollup-plugin-peer-deps-external';
import resolve from '@rollup/plugin-node-resolve';
import sourceMaps from 'rollup-plugin-sourcemaps';



const plugins = [
    depsExternal(),
    resolve({
        modulesOnly: true,
    }),
    typescript({
        check: false,
        rollupCommonJSResolveHack: true,
        clean: true
    }),
    commonjs(),
    sourceMaps(),
];


export default plugins;
