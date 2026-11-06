import { publications, readerContext, stories, type Publication, type Story } from './data';
import type { PublicDiscoverArticle } from './editionContent';
import { publicationTheme } from './publicationTheme';

export interface DiscoverArticle {
  story: Pick<Story, 'id' | 'title' | 'tag' | 'image'>;
  publication: Publication;
  href?: string;
}

export function localDiscoverArticles() {
  const articles = new Map<string, DiscoverArticle>();
  for (const publication of publications) {
    for (const [index, storyIndex] of publication.storyOrder.entries()) {
      const story = stories[storyIndex];
      // Demo publications share stories. Use the publication that features each story when possible.
      if (!articles.has(story.id) || index === 0) articles.set(story.id, { story, publication });
    }
  }
  return [...articles.values()];
}

export async function fetchDiscoverArticles(signal: AbortSignal): Promise<DiscoverArticle[]> {
  const response = await fetch('/api/discover', { signal });
  if (!response.ok) throw new Error('Could not load Discover articles');
  const articles: PublicDiscoverArticle[] = await response.json();
  return articles.filter(({ publication }) => publication.slug !== readerContext.edition?.publication.slug)
    .map(({ id, title, imageUrl, publication }) => ({
      story: { id, title, tag: '', image: imageUrl || '' },
      publication: {
        ...publicationTheme(publication.brandColor),
        id: publication.slug, name: publication.name, subtitle: '', storyOrder: [], logoUrl: publication.logoUrl, theme: 'cms',
      },
      href: `/${publication.slug}?${new URLSearchParams({ article: id })}`,
    }));
}

export function shuffleDiscoverArticles(articles: DiscoverArticle[]) {
  const shuffled = [...articles];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
