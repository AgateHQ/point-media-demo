import { flushSync, mount, unmount } from 'svelte';
import { configureEditionPreview } from './data';
import { articleToPreview, editionNavigation, type EditionContent } from './editionContent';
import { readerRuntime } from './readerRuntime.svelte';
import { resetReaderScroll, settleEditionTurn } from './editionNavigation';
import './style.css';
import './preview-reader.css';

export async function mountEditionPreview(target: HTMLElement, content: EditionContent) {
  const assetBase = new URL(/* @vite-ignore */ import.meta.env.BASE_URL, import.meta.url).href;
  configureEditionPreview(content, assetBase);
  // Content and its storage namespace must be configured before the state module loads.
  const { default: App } = await import('./App.svelte');
  const { demo, getStories, storyIndex } = await import('./demo.svelte');
  const app = mount(App, { target });
  let previous = content;
  return {
    destroy: () => unmount(app),
    update(next: EditionContent) {
      settleEditionTurn();
      const story = getStories()[storyIndex()];
      const currentId = previous.articles.find(article => `cms-article-${article.id}` === story?.id)?.id;
      const articleId = articleToPreview(previous, next, currentId);
      const index = Math.max(0, next.articles.findIndex(article => article.id === articleId));
      flushSync(() => {
        configureEditionPreview(next, assetBase);
        demo.data.publication = `cms-edition-${next.id}`;
        demo.data.position = editionNavigation(next.articles.length).storyPosition(index);
        demo.data.screen = 'reader';
        demo.sheet = null;
        readerRuntime.revision += 1;
      });
      if (currentId !== articleId) resetReaderScroll();
      previous = next;
    },
  };
}
