import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import rollupNodePolyFill from 'rollup-plugin-node-polyfills';
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill';
import { NodeModulesPolyfillPlugin } from '@esbuild-plugins/node-modules-polyfill';
import inject from '@rollup/plugin-inject';

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [
		svelte({
			emitCss: false,
			compilerOptions: {
				css: 'injected'
			}
		}),
		NodeGlobalsPolyfillPlugin({
			process: true,
			buffer: true
		}),
		NodeModulesPolyfillPlugin()
	],
	resolve: {
		alias: {
			process: 'process/browser',
			stream: 'rollup-plugin-node-polyfills/polyfills/stream',
			util: 'rollup-plugin-node-polyfills/polyfills/util',
			buffer: 'rollup-plugin-node-polyfills/polyfills/buffer-es6'
		}
	},
	optimizeDeps: {
		include: ['nostr-tools > create-hash'],
		esbuildOptions: {
			// Node.js global to browser globalThis
			define: {
				global: 'globalThis'
			},
			plugins: [
				NodeGlobalsPolyfillPlugin({
					process: true,
					buffer: true
				}),
				NodeModulesPolyfillPlugin()
			]
		}
	},
	build: {
		target: 'esnext',
		lib: {
			entry: './src/main.ts',
			name: 'nostrOpinion',
			formats: ['es']
		},
		rollupOptions: {
			plugins: [rollupNodePolyFill(), inject({ Buffer: ['Buffer', 'Buffer'] })]
		}
	},
	define: {}
});
