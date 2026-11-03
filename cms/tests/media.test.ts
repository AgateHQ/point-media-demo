import assert from 'node:assert/strict';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import type { PayloadRequest } from 'payload';
import { serveExtensionlessSvg } from '../lib/serveExtensionlessSvg';

test('extensionless SVG uploads keep their URL and receive the correct image headers', async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'point-media-svg-'));
  const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"><rect width="10" height="10" /></svg>';
  try {
    await writeFile(path.join(directory, '400'), svg);
    const handler = serveExtensionlessSvg(directory);
    const args = { doc: { id: 1, mimeType: 'image/svg+xml' }, headers: new Headers(), params: { collection: 'media', filename: '400' } };
    const response = await handler({} as PayloadRequest, args);
    assert.ok(response instanceof Response);
    assert.equal(response.headers.get('content-type'), 'image/svg+xml');
    assert.ok(response.headers.get('content-security-policy')?.includes("script-src 'none'"));
    assert.equal(await response.text(), svg);
    const publicRequest = { payload: { find: async () => ({ docs: [{ id: 1, mimeType: 'image/svg+xml' }] }) } } as unknown as PayloadRequest;
    // Public-file handlers receive no document despite Payload's narrower type.
    const publicArgs = { ...args, doc: undefined } as unknown as Parameters<typeof handler>[1];
    const publicResponse = await handler(publicRequest, publicArgs);
    assert.ok(publicResponse instanceof Response);
    assert.equal(publicResponse.headers.get('content-type'), 'image/svg+xml');
    const png = { id: 1, mimeType: 'image/png' };
    const pngResponse = await handler({} as PayloadRequest, { ...args, doc: png });
    assert.ok(pngResponse instanceof Response);
    assert.equal(pngResponse.headers.get('content-type'), 'image/png');
    assert.equal(await handler({} as PayloadRequest, { ...args, params: { ...args.params, filename: '../400' } }), undefined);
    assert.equal(await handler({} as PayloadRequest, { ...args, params: { ...args.params, filename: '400.svg' } }), undefined);
  } finally { await rm(directory, { recursive: true, force: true }); }
});
