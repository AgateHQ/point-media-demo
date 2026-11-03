import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
  base: '/reader/',
  plugins: [svelte()],
  build: {
    outDir: 'cms/public/reader',
    emptyOutDir: true,
    lib: {
      entry: 'src/preview-entry.ts',
      formats: ['es'],
      fileName: 'reader',
      cssFileName: 'reader',
    },
  },
});
