import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    svelte({
      emitCss: false,
      compilerOptions: {
        css: 'injected',
      },
    }),
  ],
  build: {
    target: 'esnext',
    lib: {
      entry: './src/main.ts',
      name: 'nostrOpinion',
      formats: ['es'],
    },
  },
});
