import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import { getPayload } from 'payload';
import { findPublicationReader, findPublicDiscoverArticles } from '../lib/publicationReader';
import { toEditionContent } from '../lib/editionContent';

test('open editorial workflow persists media, publications, editions, and article order', async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'point-media-cms-'));
  process.env.DATABASE_URL = `file:${path.join(directory, 'test.db')}`;
  process.env.MEDIA_DIR = path.join(directory, 'media');
  const { default: config } = await import('../payload.config');
  const payload = await getPayload({ config });

  try {
    const { user } = await payload.auth({ headers: new Headers() });
    assert.equal(user?.name, 'Shared editor', 'anonymous requests receive the shared editor identity');

    const image = await payload.create({
      collection: 'media',
      overrideAccess: false,
      data: { alt: 'Test publication logo' },
      file: {
        data: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aVxkAAAAASUVORK5CYII=', 'base64'),
        mimetype: 'image/png',
        name: 'logo.png',
        size: 68,
      },
    });
    const publication = await payload.create({
      collection: 'publications',
      overrideAccess: false,
      data: { name: 'Test Gazette', headline: 'A daily test edition', logo: image.id, brandColor: '#36B' },
    });
    assert.equal(publication.slug, 'test-gazette');
    assert.equal(publication.brandColor, '#3366bb');
    await payload.update({ collection: 'publications', id: publication.id, data: { name: 'Renamed Gazette' } });
    assert.equal((await payload.findByID({ collection: 'publications', id: publication.id })).slug, 'test-gazette', 'renaming keeps shared links stable');
    const secondPublication = await payload.create({ collection: 'publications', data: { name: 'Test Gazette', headline: 'Another publication', logo: image.id } });
    assert.equal(secondPublication.slug, 'test-gazette-2');
    for (const data of [{ slug: 'test-gazette' }, { slug: 'admin' }, { brandColor: 'red' }]) {
      await assert.rejects(payload.update({ collection: 'publications', id: secondPublication.id, data }));
    }
    const body = {
      root: {
        type: 'root', version: 1, direction: null as null, format: '' as const, indent: 0,
        children: [{
          type: 'paragraph', version: 1, direction: null, format: '', indent: 0,
          children: [{ type: 'text', version: 1, text: 'A formatted article.', format: 1, detail: 0, mode: 'normal', style: '' }],
        }],
      },
    };
    const edition = await payload.create({
      collection: 'editions',
      overrideAccess: false,
      depth: 0,
      data: {
        publication: publication.id,
        startDate: '2026-11-02T00:00:00.000Z',
        endDate: '2026-11-03T00:00:00.000Z',
        articles: [
          { title: 'Image story', body, mediaType: 'image', mainImage: image.id },
          { title: 'Video story', body, mediaType: 'video', videoUrl: 'https://example.com/story.mp4' },
        ],
      },
    });
    assert.equal(edition.title, '2026-11-02 — 2026-11-03');
    assert.equal(edition.publication, publication.id);
    assert.deepEqual(edition.articles?.map(article => article.title), ['Image story', 'Video story']);

    await payload.update({
      collection: 'editions', id: edition.id, overrideAccess: false,
      data: { articles: [...edition.articles!].reverse() },
    });
    const saved = await payload.findByID({ collection: 'editions', id: edition.id, depth: 1, overrideAccess: false });
    assert.deepEqual(saved.articles?.map(article => article.title), ['Video story', 'Image story']);
    assert.deepEqual(saved.articles?.[0].body, body, 'rich text formatting survives saving and reordering');
    assert.equal(typeof saved.articles?.[1].mainImage, 'object', 'uploaded main images are populated');

    const future = await payload.create({ collection: 'editions', data: { publication: publication.id, startDate: '2099-01-01T00:00:00.000Z', endDate: '2099-01-02T00:00:00.000Z', articles: [] } });
    const reader = await findPublicationReader(payload, 'test-gazette', new Date('2026-11-04T12:00:00.000Z'));
    assert.equal(reader?.edition?.id, edition.id, 'public URLs show the latest started edition, excluding future editions');
    assert.equal(toEditionContent(reader?.edition).publication.brandColor, '#3366bb');
    assert.equal((await findPublicationReader(payload, 'test-gazette-2'))?.edition, null, 'publications never use another publication’s articles');
    assert.equal(await findPublicationReader(payload, 'missing'), null);

    const createDiscoverEdition = (publicationId: number, startDate: string, endDate: string, title: string) => payload.create({
      collection: 'editions',
      data: { publication: publicationId, startDate, endDate, articles: [{ title, body, mediaType: 'image', mainImage: image.id }] },
    });
    const older = await createDiscoverEdition(publication.id, '2026-10-01', '2026-10-02', 'Older story');
    const other = await createDiscoverEdition(secondPublication.id, '2026-11-01', '2026-11-02', 'Another publication’s story');
    const discover = await findPublicDiscoverArticles(payload, new Date('2026-11-04T12:00:00.000Z'));
    assert.deepEqual(discover.map(article => [article.publication.slug, article.title]).sort(), [
      ['test-gazette', 'Image story'], ['test-gazette', 'Video story'], ['test-gazette-2', 'Another publication’s story'],
    ]);
    const imageCard = discover.find(article => article.title === 'Image story');
    assert.equal(imageCard?.id, saved.articles?.[1].id);
    assert.equal(imageCard?.imageUrl, image.url);
    await payload.delete({ collection: 'editions', id: older.id });
    await payload.delete({ collection: 'editions', id: other.id });
    await payload.delete({ collection: 'editions', id: future.id });

    const joined = await payload.findByID({ collection: 'publications', id: publication.id, overrideAccess: false });
    assert.equal(joined.editions?.docs?.length, 1);
    const joinedEdition = joined.editions!.docs![0];
    assert.equal(typeof joinedEdition === 'object' ? joinedEdition.id : joinedEdition, edition.id);

    await assert.rejects(payload.update({
      collection: 'editions', id: edition.id, overrideAccess: false,
      data: { endDate: '2026-11-01T00:00:00.000Z' },
    }), /End Date|endDate/, 'a partial update cannot put the end before the start');
    await assert.rejects(payload.update({
      collection: 'editions', id: edition.id, overrideAccess: false,
      data: { endDate: '' },
    }), /End Date|endDate/, 'end date remains required with custom range validation');
    await assert.rejects(payload.update({
      collection: 'editions', id: edition.id, overrideAccess: false,
      data: { articles: [{ title: 'Missing image', body, mediaType: 'image' }] },
    }), /Main Image|mainImage/);
    await assert.rejects(payload.update({
      collection: 'editions', id: edition.id, overrideAccess: false,
      data: { articles: [{ title: 'Invalid video', body, mediaType: 'video', videoUrl: 'javascript:alert(1)' }] },
    }), /Video URL|videoUrl/);
    await assert.rejects(payload.delete({
      collection: 'publications', id: publication.id, overrideAccess: false,
    }), /Delete this publication/);

    await payload.delete({ collection: 'editions', id: edition.id, overrideAccess: false });
    await payload.delete({ collection: 'publications', id: publication.id, overrideAccess: false });
    await payload.delete({ collection: 'publications', id: secondPublication.id });
    await payload.delete({ collection: 'media', id: image.id, overrideAccess: false });
  } finally {
    await payload.destroy();
    await rm(directory, { recursive: true, force: true });
  }
});
