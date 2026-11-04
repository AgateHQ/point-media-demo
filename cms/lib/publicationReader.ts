import type { Payload } from 'payload';

export async function findPublicationReader(payload: Payload, slug: string, now = new Date()) {
  const { docs } = await payload.find({
    collection: 'publications', where: { slug: { equals: slug } }, depth: 1, joins: false, limit: 1, overrideAccess: false,
  });
  const publication = docs[0];
  if (!publication) return null;
  const { docs: editions } = await payload.find({
    collection: 'editions',
    where: { and: [{ publication: { equals: publication.id } }, { startDate: { less_than_equal: now.toISOString() } }] },
    sort: ['-startDate', '-id'], depth: 2, limit: 1, overrideAccess: false,
  });
  return { publication, edition: editions[0] ? { ...editions[0], publication } : null };
}
