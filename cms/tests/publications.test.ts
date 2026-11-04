import assert from 'node:assert/strict';
import { test } from 'node:test';
import { contrastRatio, normalizeHex, publicationTheme } from '../../src/publicationTheme';
import { publicationSlug, uniquePublicationSlug, validPublicationSlug } from '../lib/publicationSlug';

test('publication addresses handle accents, collisions and reserved routes', async () => {
  assert.equal(publicationSlug('  The Café & Gazette!  '), 'the-cafe-gazette');
  assert.equal(await uniquePublicationSlug('The Gazette', async slug => ['the-gazette', 'the-gazette-2'].includes(slug)), 'the-gazette-3');
  assert.equal(await uniquePublicationSlug('Admin', async () => false), 'admin-publication');
  for (const slug of ['admin', 'api', 'preview', 'health', 'reader', '../admin', 'UPPER', '', 'bad--slug']) assert.equal(validPublicationSlug(slug), false, slug);
  assert.equal(validPublicationSlug('the-gazette-2'), true);
});

test('one hex colour produces readable paper accents and masthead/button text', () => {
  assert.equal(normalizeHex(' #3Af '), '#33aaff');
  for (const invalid of ['red', '#12', '#12345678', 'url(https://example.com)', null]) assert.equal(normalizeHex(invalid), undefined);
  for (const hex of ['#ffffff', '#000000', '#ffff00', '#2563eb', '#ff00ff', '#00ff00', '#dc2626', '#808080', '#369']) {
    const theme = publicationTheme(hex);
    assert.equal(theme.accent, normalizeHex(hex));
    assert.ok(contrastRatio(theme.brand, theme.color) >= 4.5, `${hex}: accent text`);
    assert.ok(contrastRatio(theme.ink, theme.color) >= 4.5, `${hex}: body text`);
    assert.ok(contrastRatio(theme.header, theme.headerInk) >= 4.5, `${hex}: header text`);
    assert.ok(contrastRatio(theme.accent, theme.brandInk) >= 4.5, `${hex}: button text`);
  }
});
