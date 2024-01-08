import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js';

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [
		svelte({
			emitCss: false,
			compilerOptions: {
				customElement: true,
				css: 'injected'
			}
		})
	],
	build: {
		target: 'es2018',
		lib: {
			entry: './src/main.ts',
			name: 'nostrOpinion',
			formats: ['es']
		}
	},
	define: {}
});
