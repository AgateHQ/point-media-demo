import { mount, unmount } from 'svelte';
import { configureEditionPreview } from './data';
import type { EditionContent } from './editionContent';
import './style.css';
import './preview-reader.css';

export async function mountEditionPreview(target: HTMLElement, content: EditionContent) {
  configureEditionPreview(content, new URL(/* @vite-ignore */ import.meta.env.BASE_URL, import.meta.url).href);
  // Content and its storage namespace must be configured before the state module loads.
  const { default: App } = await import('./App.svelte');
  const app = mount(App, { target });
  return () => unmount(app);
}
