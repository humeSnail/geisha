import babel from 'rollup-plugin-babel';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import { terser } from 'rollup-plugin-terser';
import dts from 'rollup-plugin-dts';

const extensions = ['.js', '.jsx', '.ts', '.tsx'];

export default {
    input: './src/index.ts',
    output: [
        {
            dir: 'lib',
            format: 'cjs',
            entryFileNames: '[name].js',
            exports: 'named'
        },
        {
            dir: 'es',
            format: 'esm',
            entryFileNames: '[name].js',
            exports: 'named'
        },
        {
            dir: 'dist',
            format: 'iife',
            name: 'index.js',
            plugins: [terser()]
        },
        {
            dir: 'dist',
            name: 'index.d.js',
            plugins: [dts()]
        }
    ],
    plugins: [
        resolve({
            mainFields: ['module', 'main'],
            browser: true,
            extensions
        }),
        commonjs({
            include: /\/node_modules\//
        }),
        babel({
            rootMode: 'upward',
            runtimeHelpers: true,
            extensions,
            exclude: 'node_modules/**'
        })
    ]
};
