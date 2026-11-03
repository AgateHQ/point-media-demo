import assert from 'node:assert/strict';
import { test } from 'node:test';

import { contentHref, previewVideo } from '../lib/preview';

test('video previews embed supported providers and preserve direct file URLs', () => {
  for (const url of ['https://youtu.be/M7lc1UVf-VE', 'https://www.youtube.com/watch?v=M7lc1UVf-VE', 'https://www.youtube.com/shorts/M7lc1UVf-VE']) {
    assert.deepEqual(previewVideo(url), { type: 'embed', url: 'https://www.youtube-nocookie.com/embed/M7lc1UVf-VE' });
  }
  assert.deepEqual(previewVideo('https://vimeo.com/123456/abc123'), { type: 'embed', url: 'https://player.vimeo.com/video/123456?h=abc123' });
  assert.deepEqual(previewVideo('https://cdn.example.com/story.mp4?token=test'), { type: 'file', url: 'https://cdn.example.com/story.mp4?token=test' });
  assert.deepEqual(previewVideo('https://example.com/watch/123'), { type: 'link', url: 'https://example.com/watch/123' });
  assert.equal(previewVideo('javascript:alert(1)'), null);
  assert.equal(previewVideo('not a url'), null);
  assert.equal(previewVideo(null), null);
  assert.equal(previewVideo('https://youtube.com.example.org/watch?v=M7lc1UVf-VE')?.type, 'link');
});

test('internal rich-text links resolve editions and uploaded media', () => {
  assert.equal(contentHref('editions', { id: 42 }), '/preview/editions/42');
  assert.equal(contentHref('editions', 42), '/preview/editions/42');
  assert.equal(contentHref('media', { id: 3, url: '/api/media/file/image.png' }), '/api/media/file/image.png');
  assert.equal(contentHref('publications', { id: 2 }), '/admin/collections/publications/2');
  assert.equal(contentHref('editions', null), '/admin');
});
