import commonjs from '@rollup/plugin-commonjs'
import resolve from '@rollup/plugin-node-resolve'
import terser from '@rollup/plugin-terser'
import typescript from '@rollup/plugin-typescript'
import autoprefixer from 'autoprefixer'
import peerDepsExternal from 'rollup-plugin-peer-deps-external'
import postcss from 'rollup-plugin-postcss'
import postcssUrl from 'postcss-url'

const dts = require('rollup-plugin-dts').default
const packageJson = require('./package.json')

export default [
	{
		input: 'src/index.ts',
		output: [
			{
				file: packageJson.exports['.'].import,
				format: 'esm',
				sourcemap: false
			},
			{
				file: packageJson.exports['.'].require,
				format: 'cjs',
				sourcemap: false,
				exports: 'named'
			}
		],
		plugins: [
			peerDepsExternal(),
			resolve({ browser: true }),
			commonjs(),
			postcss({
				plugins: [
					autoprefixer(),
					postcssUrl({
						url: 'copy',
						assetsPath: 'fonts',
						useHash: false
					})
				],
				modules: true,
				extract: 'index.css',
				minimize: true,
				sourceMap: false,
				autoModules: true,
				to: 'dist/index.css'
			}),
			typescript({
				tsconfig: './tsconfig.json',
				declaration: false
			}),
			terser()
		],
		external: ['hls.js']
	},
	{
		input: 'src/index.ts',
		output: [{ file: 'dist/index.d.ts', format: 'esm' }],
		plugins: [dts()]
	}
]
