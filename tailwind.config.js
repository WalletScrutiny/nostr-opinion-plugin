/** @type {import('tailwindcss').Config} */
export default {
	content: ['./index.html', './src/**/*.{svelte,js,ts}'],
	plugins: [],
	theme: {
		extend: {
			fontFamily: {
				lato: ['Lato', 'sans-serif']
			}
		}
	},
	variants: {
		extend: {}
	}
};
