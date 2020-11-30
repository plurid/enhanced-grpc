import typescript from 'rollup-plugin-typescript2';
import commonjs from '@rollup/plugin-commonjs';
import depsExternal from 'rollup-plugin-peer-deps-external';
import resolve from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';

import pkg from './package.json';



const plugins = [
    replace({
        'process.env.ENV_MODE': JSON.stringify(process.env.ENV_MODE),
    }),
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
];


export default {
    input: 'source/index.ts',
    output: [
        {
            file: pkg.main,
            format: 'cjs',
            exports: 'named',
            sourcemap: true,
        },
        {
            file: pkg.module,
            format: 'es',
            exports: 'named',
            sourcemap: true,
        }
    ],
    plugins,
}
