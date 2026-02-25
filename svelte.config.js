import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

export default {
	preprocess: [vitePreprocess()],
	compilerOptions: {
		customElement: true,
		compatibility: {
			componentApi: 4
		}
	}
};
