import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

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
