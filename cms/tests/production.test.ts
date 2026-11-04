import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import { BasePayload } from 'payload';

test('production initializes an empty volume and retains database records and uploads across restarts', async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'point-media-production-'));
  Object.assign(process.env, { NODE_ENV: 'production' });
  process.env.PAYLOAD_SECRET = 'isolated-production-migration-test-secret';
  process.env.DATABASE_URL = `file:${path.join(directory, 'payload.db')}`;
  process.env.MEDIA_DIR = path.join(directory, 'media');
  const { default: config } = await import('../payload.config');
  let payload = new BasePayload();
  try {
    await payload.init({ config });
    const image = await payload.create({
      collection: 'media', data: { alt: 'Persistent logo' },
      file: { data: Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"><rect width="20" height="20" fill="blue"/></svg>'), mimetype: 'image/svg+xml', name: 'persistent.svg', size: 126 },
    });
    const publication = await payload.create({ collection: 'publications', data: { name: 'Persistent News', headline: 'Ready after restarting', logo: image.id, brandColor: '#2563eb' } });
    assert.equal((await payload.count({ collection: 'payload-migrations' })).totalDocs, 1);
    await payload.destroy();
    payload = new BasePayload();
    await payload.init({ config });
    const restored = await payload.findByID({ collection: 'publications', id: publication.id });
    assert.equal(restored.slug, 'persistent-news');
    assert.equal(restored.brandColor, '#2563eb');
    assert.match(await readFile(path.join(directory, 'media', image.filename!), 'utf8'), /<svg/);
    assert.equal((await payload.count({ collection: 'editors' })).totalDocs, 1, 'initialization never duplicates the shared identity');
    assert.equal((await payload.count({ collection: 'payload-migrations' })).totalDocs, 1, 'already-applied migrations are skipped');
  } finally {
    await payload.destroy();
    await rm(directory, { recursive: true, force: true });
  }
});
