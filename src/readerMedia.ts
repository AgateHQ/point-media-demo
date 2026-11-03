export type PreviewVideo = { type: 'embed' | 'file' | 'link'; url: string };

export function previewVideo(value: string | null | undefined): PreviewVideo | null {
  let url: URL;
  try { url = new URL(value || ''); } catch { return null; }
  if (!['https:', 'http:'].includes(url.protocol)) return null;

  const host = url.hostname.toLowerCase();
  let youtubeId: string | null = null;
  if (host === 'youtu.be') youtubeId = url.pathname.split('/')[1];
  if (['youtube.com', 'www.youtube.com', 'm.youtube.com', 'www.youtube-nocookie.com'].includes(host)) {
    youtubeId = url.searchParams.get('v') || url.pathname.match(/^\/(?:embed|shorts)\/([^/]+)\/?$/)?.[1] || null;
  }
  if (youtubeId && /^[\w-]{11}$/.test(youtubeId)) {
    return { type: 'embed', url: `https://www.youtube-nocookie.com/embed/${youtubeId}` };
  }
  if (['vimeo.com', 'www.vimeo.com', 'player.vimeo.com'].includes(host)) {
    const match = url.pathname.match(/^\/(?:video\/)?(\d+)(?:\/([a-zA-Z0-9]+))?\/?$/);
    if (match) {
      const embed = new URL(`https://player.vimeo.com/video/${match[1]}`);
      const hash = match[2] || url.searchParams.get('h');
      if (hash) embed.searchParams.set('h', hash);
      return { type: 'embed', url: embed.href };
    }
  }
  return { type: /\.(mp4|webm|ogv|ogg)$/i.test(url.pathname) ? 'file' : 'link', url: url.href };
}

export function contentHref(collection: string, value: unknown): string {
  const doc = value && typeof value === 'object' ? value as { id?: number | string; url?: string } : null;
  const id = doc?.id ?? value;
  if (collection === 'media' && doc?.url) return doc.url;
  if (typeof id !== 'number' && typeof id !== 'string') return '/admin';
  return collection === 'editions'
    ? `/preview/editions/${encodeURIComponent(id)}`
    : `/admin/collections/${encodeURIComponent(collection)}/${encodeURIComponent(id)}`;
}
