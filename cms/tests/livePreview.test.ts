import assert from 'node:assert/strict';
import { test } from 'node:test';
import { articleToPreview } from '../../src/editionContent';
import { toEditionContent } from '../lib/editionContent';
import { populateLiveEdition } from '../lib/liveEdition';

test('live preview tolerates empty and incomplete unsaved form values', () => {
  const empty = toEditionContent({ startDate: 'not a date', articles: [{ id: 'new-row', title: '', body: null, mediaType: 'video', videoUrl: '' }] }, true);
  assert.equal(empty.live, true);
  assert.equal(empty.id, 0);
  assert.equal(empty.publication.name, 'Your publication');
  assert.equal(empty.startDate, '');
  assert.equal(empty.articles[0].title, 'Untitled article');
  assert.deepEqual(empty.articles[0].body.root.children, []);
  assert.equal(toEditionContent(null, true).articles.length, 0);
});

test('editing follows the changed article while reordering preserves the current article', () => {
  const previous = toEditionContent({ id: 1, articles: [{ id: 'a', title: 'First' }, { id: 'b', title: 'Second' }] }, true);
  const reordered = { ...previous, articles: [...previous.articles].reverse() };
  assert.equal(articleToPreview(previous, reordered, 'b'), 'b');
  const edited = { ...previous, articles: [{ ...previous.articles[0], title: 'First edited' }, previous.articles[1]] };
  assert.equal(articleToPreview(previous, edited, 'b'), 'a');
  assert.equal(articleToPreview(previous, { ...previous, articles: [previous.articles[0]] }, 'b'), 'a');
  assert.equal(articleToPreview(previous, { ...previous, articles: [] }, 'a'), undefined);
});

test('unsaved relationship IDs populate publication branding, main images, and rich-text uploads', async () => {
  const input = {
    id: 1, publication: 2, articles: [{ id: 'a', title: 'Unsaved headline', mediaType: 'image', mainImage: 3,
      body: { root: { type: 'root', children: [
        { type: 'paragraph', children: [{ type: 'text', text: 'Unsaved text', format: 1 }] },
        { type: 'upload', relationTo: 'media', value: 4 },
      ] } },
    }],
  };
  const before = JSON.stringify(input);
  const populated = await populateLiveEdition(input, async (collection, id) => collection === 'publications'
    ? { id, name: 'Live News', headline: 'Writing now', logo: { url: '/api/media/file/logo.svg' } }
    : { id, url: `/api/media/file/${id}.png`, alt: `Image ${id}` });
  const content = toEditionContent(populated, true);
  assert.equal(content.publication.name, 'Live News');
  assert.equal(content.publication.logoUrl, '/api/media/file/logo.svg');
  assert.equal(content.articles[0].imageUrl, '/api/media/file/3.png');
  assert.equal((content.articles[0].body.root.children?.[1].value as { url: string }).url, '/api/media/file/4.png');
  assert.equal(content.articles[0].body.root.children?.[0].children?.[0].format, 1);
  assert.equal(JSON.stringify(input), before, 'populating the preview never changes editor data');
});
