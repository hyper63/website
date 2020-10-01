import svelte from 'rollup-plugin-svelte'
import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import { terser } from 'rollup-plugin-terser'

export default {
  input: 'src/main.js',
  output: {
    format: 'iife',
    name: 'sapperWorkshop',
    file: 'public/sapper-workshop.js'
  },
  plugins: [
    svelte({
      css: css => css.write('sapper-workshop.css')
    }),
    resolve(),
    commonjs(),
    terser()
  ]
}
