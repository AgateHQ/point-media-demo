import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

// The GitHub Pages custom domain serves this project from the domain root.
export default defineConfig({
  base: '/',
  plugins: [svelte()],
});
