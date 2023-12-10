import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js';

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [
		nodePolyfills({
			include: ['stream', 'util', 'events'],
			globals: {
				global: true
			}
		}),
		svelte({
			emitCss: false,
			compilerOptions: {
				customElement: true,
				css: 'injected'
			}
		}),
		cssInjectedByJsPlugin({
			injectCodeFunction: (cssCode, opts) => {
				if (typeof document !== 'undefined') {
					document.addEventListener('DOMContentLoaded', () => {
						document
							.querySelectorAll('nostr-opinion')
							.forEach((el) =>
								el.shadowRoot
									.querySelector('#css-injection-pot')
									.appendChild(document.createTextNode(cssCode))
							);
					});
				}
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
