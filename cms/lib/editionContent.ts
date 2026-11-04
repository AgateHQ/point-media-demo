import type { EditionContent, RichTextDocument } from '../../src/editionContent';

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {};
}
function text(value: unknown) { return typeof value === 'string' ? value : ''; }
function date(value: unknown) {
  const result = text(value);
  return result && Number.isFinite(Date.parse(result)) ? result : '';
}

// Live form data can be incomplete, especially while adding an unsaved article.
export function toEditionContent(value: unknown, live = false): EditionContent {
  const edition = record(value);
  const publication = record(edition.publication);
  const logo = record(publication.logo);
  const articles = Array.isArray(edition.articles) ? edition.articles : [];
  return {
    id: typeof edition.id === 'number' ? edition.id : Number(edition.id) || 0,
    live,
    publication: {
      id: typeof publication.id === 'number' ? publication.id : 0,
      name: text(publication.name) || 'Your publication',
      headline: text(publication.headline),
      logoUrl: text(logo.url) || undefined,
    },
    startDate: date(edition.startDate), endDate: date(edition.endDate),
    articles: articles.map((value, index) => {
      const article = record(value);
      const body = record(article.body);
      const root = record(body.root);
      const image = article.mediaType === 'image' ? record(article.mainImage) : {};
      return {
        id: text(article.id) || `unsaved-${index}`,
        title: text(article.title) || 'Untitled article',
        body: Array.isArray(root.children) ? body as unknown as RichTextDocument : { root: { type: 'root', children: [] } },
        imageUrl: text(image.url) || undefined,
        imageAlt: text(image.alt) || undefined,
        videoUrl: article.mediaType === 'video' ? text(article.videoUrl) || undefined : undefined,
      };
    }),
  };
}
