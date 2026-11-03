import assert from 'node:assert/strict';
import { test } from 'node:test';

import { editionNavigation, richTextPreview, richTextText, type RichTextDocument } from '../../src/editionContent';

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
