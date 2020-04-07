import resolve from '@rollup/plugin-node-resolve';
import external from 'rollup-plugin-peer-deps-external';
import commonjs from '@rollup/plugin-commonjs';
import sourceMaps from 'rollup-plugin-sourcemaps';
import typescript from 'rollup-plugin-typescript2';
import svg from 'rollup-plugin-svg';



export default {
    input: `source/server/index.ts`,
    output: [
        {
            file: './build/server.js',
            format: 'cjs',
        },
    ],
    plugins: [
        svg(),
        typescript({
            useTsconfigDeclarationDir: true,
        }),
        external({
            includeDependencies: true,
        }),
        resolve({
            preferBuiltins: true,
        }),
        commonjs(),
        sourceMaps(),
    ],
}
