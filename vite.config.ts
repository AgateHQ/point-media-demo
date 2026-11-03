import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

// The GitHub Pages custom domain serves this project from the domain root.
export default defineConfig({
  base: '/',
  plugins: [svelte()],
  server: {
    watch: { ignored: ['**/cms/**'] },
    proxy: {
      '/admin': { target: 'http://127.0.0.1:3000', changeOrigin: false },
      '/preview': { target: 'http://127.0.0.1:3000', changeOrigin: false },
      '/api': { target: 'http://127.0.0.1:3000', changeOrigin: false },
      '/_next': { target: 'http://127.0.0.1:3000', changeOrigin: false, ws: true },
    },
  },
});
