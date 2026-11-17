import { publications, readerContext, stories, storyVideos, type Publication, type Story } from './data';
import type { PublicDiscoverArticle } from './editionContent';
import { publicationTheme } from './publicationTheme';
import { youtubeVideoId } from './readerMedia';

export interface DiscoverArticle {
  story: Pick<Story, 'id' | 'title' | 'tag' | 'image' | 'videoUrl'>;
  publication: Publication;
  href?: string;
}

export interface DiscoverPublication {
  publication: Publication;
  lead: DiscoverArticle['story'];
  articleCount: number;
  href?: string;
}

export function discoverPublications(networkArticles: DiscoverArticle[] = []): DiscoverPublication[] {
  const editions = new Map<string, DiscoverPublication>();
  for (const publication of publications) {
    const lead = stories[publication.storyOrder[0]];
    if (lead) editions.set(publication.id, { publication, lead, articleCount: publication.storyOrder.length });
  }
  for (const article of networkArticles) {
    if (!article.href) continue;
    const existing = editions.get(article.publication.id);
    if (existing) {
      if (existing.href) existing.articleCount += 1;
    } else {
      editions.set(article.publication.id, {
        publication: article.publication, lead: article.story, articleCount: 1, href: article.href.split('?')[0],
      });
    }
  }
  return [...editions.values()];
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
    .map(({ id, title, imageUrl, videoUrl, publication }) => ({
      story: { id, title, tag: '', image: imageUrl || '', videoUrl },
      publication: {
        ...publicationTheme(publication.brandColor),
        id: publication.slug, name: publication.name, subtitle: '', storyOrder: [], logoUrl: publication.logoUrl, theme: 'cms',
      },
      href: `/${publication.slug}?${new URLSearchParams({ article: id })}`,
    }));
}

export function discoverVideoId({ story, publication }: DiscoverArticle) {
  return youtubeVideoId(story.videoUrl) || storyVideos[`${publication.id}:${story.id}`];
}

export function shuffleDiscoverArticles(articles: DiscoverArticle[]) {
  const shuffled = [...articles];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  const videos = shuffled.filter(article => discoverVideoId(article));
  const images = shuffled.filter(article => !discoverVideoId(article));
  if (!videos.length || !images.length) return shuffled;

  const alternating: DiscoverArticle[] = [];
  // Repeat the smaller pool so every story stays available and the loop
  // remains video/image even when the catalog has an uneven mix.
  for (let i = 0; i < Math.max(videos.length, images.length); i++) {
    alternating.push(videos[i % videos.length], images[i % images.length]);
  }
  return alternating;
}
