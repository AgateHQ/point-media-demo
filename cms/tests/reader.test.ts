import assert from 'node:assert/strict';
import { test } from 'node:test';

import { editionNavigation, richTextPreview, richTextText, type RichTextDocument } from '../../src/editionContent';
import { discoverVideoId, fetchDiscoverArticles, localDiscoverArticles, shuffleDiscoverArticles } from '../../src/discover';

test('Discover alternates video and image covers through the whole demo loop without losing stories', () => {
  const catalog = localDiscoverArticles();
  const originalOrder = catalog.map(article => article.story.id);
  assert.equal(catalog.filter(article => discoverVideoId(article)).length, catalog.length / 2);
  for (let run = 0; run < 10; run++) {
    const deck = shuffleDiscoverArticles(catalog);
    assert.deepEqual(new Set(deck.map(article => article.story.id)), new Set(originalOrder));
    assert.equal(deck.length, originalOrder.length);
    deck.forEach((article, index) => {
      assert.equal(!!discoverVideoId(article), index % 2 === 0, `card ${index + 1}`);
      assert.notEqual(!!discoverVideoId(article), !!discoverVideoId(deck[(index + 1) % deck.length]), 'alternation continues across the loop');
    });
  }
  assert.deepEqual(catalog.map(article => article.story.id), originalOrder, 'shuffling leaves the source catalog intact');
});

test('Discover keeps every article when an edition has only one media type', () => {
  const catalog = localDiscoverArticles();
  const videos = catalog.filter(article => discoverVideoId(article));
  const images = catalog.filter(article => !discoverVideoId(article));
  for (const subset of [[], [videos[0]], [images[0]], videos, images]) {
    const deck = shuffleDiscoverArticles(subset);
    assert.equal(deck.length, subset.length);
    assert.deepEqual(new Set(deck), new Set(subset));
  }
});

test('Discover alternates across uneven catalogs and the loop boundary without losing articles', () => {
  const catalog = localDiscoverArticles();
  const videos = catalog.filter(article => discoverVideoId(article));
  const images = catalog.filter(article => !discoverVideoId(article));
  for (const [videoCount, imageCount] of [[1, 3], [3, 1], [2, 5], [5, 2]]) {
    const subset = [...videos.slice(0, videoCount), ...images.slice(0, imageCount)];
    for (let run = 0; run < 10; run++) {
      const deck = shuffleDiscoverArticles(subset);
      assert.equal(deck.length, 2 * Math.max(videoCount, imageCount));
      assert.deepEqual(new Set(deck), new Set(subset));
      deck.forEach((article, index) => {
        assert.equal(!!discoverVideoId(article), index % 2 === 0, `card ${index + 1}`);
        assert.notEqual(!!discoverVideoId(article), !!discoverVideoId(deck[(index + 1) % deck.length]));
        assert.notEqual(!!discoverVideoId(article), !!discoverVideoId(deck[(index - 1 + deck.length) % deck.length]));
      });
    }
  }
});

test('Discover preserves published video links when loading the network catalog', async t => {
  t.mock.method(globalThis, 'fetch', async () => Response.json([{
    id: 'network-video', title: 'Published video', videoUrl: 'https://youtu.be/CftLBPI1Ga4',
    publication: { slug: 'network-publication', name: 'Network publication' },
  }]));
  const articles = await fetchDiscoverArticles(new AbortController().signal);
  assert.equal(articles.length, 1);
  assert.equal(articles[0].story.videoUrl, 'https://youtu.be/CftLBPI1Ga4');
  assert.equal(discoverVideoId(articles[0]), 'CftLBPI1Ga4');
});

test('reader navigation maps arbitrary edition lengths around a single partner moment', () => {
  for (const total of [1, 2, 3, 8, 9, 20]) {
    const navigation = editionNavigation(total);
    const positions = Array.from({ length: total }, (_, index) => navigation.storyPosition(index));
    assert.equal(new Set(positions).size, total);
    assert.equal(positions[0], 0);
    assert.equal(positions.at(-1), navigation.last);
    if (total === 1) assert.equal(navigation.partner, -1);
    else assert.ok(!positions.includes(navigation.partner), 'the partner never replaces an article');
    positions.forEach((position, index) => assert.equal(navigation.storyIndex(position), index));
  }
  assert.deepEqual(Array.from({ length: 8 }, (_, index) => editionNavigation(8).storyPosition(index)), [0, 1, 2, 3, 5, 6, 7, 8], 'the original demo keeps its existing positions');
});

test('rich-text previews trim text without changing the source or losing structure and formatting', () => {
  const document: RichTextDocument = { root: { type: 'root', children: [
    { type: 'heading', tag: 'h2', children: [{ type: 'text', text: 'Headline', format: 1 }] },
    { type: 'paragraph', children: [{ type: 'text', text: 'A formatted sentence for previewing.', format: 2 }] },
    { type: 'quote', children: [{ type: 'text', text: 'The final quotation.', format: 0 }] },
  ] } };
  const before = JSON.stringify(document);
  const preview = richTextPreview(document);
  const text = richTextText(document.root).replace(/\n/g, '');
  assert.equal(richTextText(preview.root).replace(/\n/g, ''), text.slice(0, Math.floor(text.length * .4)));
  assert.equal(preview.root.children?.[0].tag, 'h2');
  assert.equal(preview.root.children?.[0].children?.[0].format, 1);
  assert.equal(JSON.stringify(document), before);
  assert.equal(richTextText(richTextPreview({ root: { type: 'root', children: [{ type: 'paragraph', children: [{ type: 'text', text: 'A' }] }] } }).root), 'A');
});
