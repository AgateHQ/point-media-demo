import { readFile } from 'node:fs/promises';
import path from 'node:path';
import type { PayloadRequest, UploadConfig } from 'payload';

// URL uploads can retain names such as "400". Payload's default file fallback
// detects SVGs as text/plain, so use the verified upload's MIME type.
export function serveExtensionlessSvg(mediaDir: string): NonNullable<UploadConfig['handlers']>[number] {
  async function serve(req: PayloadRequest, filename: string, doc: { mimeType?: string } | undefined): Promise<Response> {
    // For public files Payload skips fetching a document before calling handlers.
    const media = doc || (await req.payload.find({
      collection: 'media', where: { filename: { equals: filename } }, limit: 1, depth: 0,
      overrideAccess: false, req,
    })).docs[0];
    if (!media?.mimeType?.startsWith('image/')) return new Response(null, { status: 404 });
    const data = await readFile(path.join(mediaDir, filename));
    return new Response(new Uint8Array(data), { headers: {
      'Content-Type': media.mimeType,
      'Content-Length': String(data.length),
      'Content-Security-Policy': "script-src 'none'; frame-src 'none'; object-src 'none'",
      'X-Content-Type-Options': 'nosniff',
    } });
  }
  return (req, { doc, params }) => {
    const filename = params.filename;
    if (!filename || path.extname(filename) || path.basename(filename) !== filename) return;
    return serve(req, filename, doc as { mimeType?: string } | undefined);
  };
}
