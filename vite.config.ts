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
		},
		rolldownOptions: {
			// Keep the modules shared by the main bundle and the lazy editor
			// chunk inside nostr-opinion.js instead of a third "common" file,
			// so a page load still fetches exactly one file.
			preserveEntrySignatures: 'allow-extension',
			output: {
				// Lazily imported modules (currently only the editor) become
				// sibling files of nostr-opinion.js with stable names, so a host
				// site can commit/deploy them next to the main bundle.
				chunkFileNames: (chunk) => `nostr-opinion-${chunk.name.toLowerCase()}.js`
			}
		}
	},
	define: {}
});
