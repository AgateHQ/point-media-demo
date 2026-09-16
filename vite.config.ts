import { defineConfig } from 'vite';

// Base path matches the GitHub Pages project URL (https://agatehq.github.io/point-media-demo/)
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/point-media-demo/' : '/',
}));
