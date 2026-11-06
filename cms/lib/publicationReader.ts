import type { Payload, Where } from 'payload';
import type { PublicDiscoverArticle } from '../../src/editionContent';
import { toEditionContent } from './editionContent';

function currentEditionQuery(publicationId: number, now: Date) {
  const where: Where = { and: [{ publication: { equals: publicationId } }, { startDate: { less_than_equal: now.toISOString() } }] };
  return {
    collection: 'editions' as const,
    where, sort: ['-startDate', '-id'], limit: 1, overrideAccess: false,
  };
}

export async function findPublicationReader(payload: Payload, slug: string, now = new Date()) {
  const { docs } = await payload.find({
    collection: 'publications', where: { slug: { equals: slug } }, depth: 1, joins: false, limit: 1, overrideAccess: false,
  });
  const publication = docs[0];
  if (!publication) return null;
  const { docs: editions } = await payload.find({
    ...currentEditionQuery(publication.id, now), depth: 2,
  });
  return { publication, edition: editions[0] ? { ...editions[0], publication } : null };
}

export async function findPublicDiscoverArticles(payload: Payload, now = new Date()): Promise<PublicDiscoverArticle[]> {
  const { docs: publications } = await payload.find({
    collection: 'publications', depth: 1, pagination: false, joins: false, overrideAccess: false,
    select: { slug: true, name: true, brandColor: true, logo: true },
  });
  const articles = await Promise.all(publications.map(async publication => {
    if (!publication.slug) return [];
    const { docs: [edition] } = await payload.find({
      ...currentEditionQuery(publication.id, now), depth: 1,
      select: { articles: { id: true, title: true, mediaType: true, mainImage: true } },
    });
    if (!edition?.articles?.length) return [];
    const content = toEditionContent({ ...edition, publication });
    const { name, brandColor, logoUrl } = content.publication;
    const source = { slug: publication.slug, name, brandColor, logoUrl };
    return content.articles.map(({ id, title, imageUrl }) => ({ id, title, imageUrl, publication: source }));
  }));
  return articles.flat();
}
