import ts from '@rollup/plugin-typescript'
import { RollupOptions } from 'rollup';
import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs';
import nodePolyfills from 'rollup-plugin-polyfill-node';
import terser from '@rollup/plugin-terser'
import config from './config.json' assert { type: "json" };

const createBanner = () => {
  let banner = '// ==UserScript==\n'
  Object.entries(config).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach(v => {
        banner += `// @${key}${new Array(20 - key.length).fill(' ').join('')}${v}\n`
      })
    } else {
      banner += `// @${key}${new Array(20 - key.length).fill(' ').join('')}${value}\n`
    }
  })
  banner += `// ==/UserScript==\n`
  return banner
}

const banner = createBanner()

export default {
  input: './src/index.ts',
  output: [
    {
      file: './dist/bundle.js',
      format: 'iife',
      banner,
    },
  ],
  plugins: [
    terser({
      format: {
        comments(_, comment) {
          if (comment.col === 0) return true
          return false
        },
      }
    }),
    ts({
      tsconfig: './tsconfig.json'
    }),
    resolve(),
    commonjs(),
    nodePolyfills(),
  ]
} as RollupOptions