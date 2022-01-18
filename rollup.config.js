import typescript from 'rollup-plugin-typescript';
import sourceMaps from 'rollup-plugin-sourcemaps';
// import ts from 'typescript';
// import { uglify } from 'rollup-plugin-uglify';
import commonjs from '@rollup/plugin-commonjs';

export default [
  {
    input: './src/index.ts',
    plugins: [
      commonjs(),
      // uglify(),
      sourceMaps(),
      typescript()
    ],
    output: [
      {
        format: 'cjs',
        name: 'index',
        dir: 'dist/',
        sourcemap: true,
      },
    ],
  },
];
