const reservedSlugs = new Set(['admin', 'api', 'preview', 'reader', 'publications', 'health', 'demo', 'favicon', 'robots', 'sitemap']);

export function publicationSlug(value: string) {
  return value.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80).replace(/-+$/g, '');
}

export function validPublicationSlug(value: unknown) {
  return typeof value === 'string' && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)
    && value.length <= 80 && !reservedSlugs.has(value);
}

export async function uniquePublicationSlug(name: string, exists: (slug: string) => Promise<boolean>) {
  let base = publicationSlug(name) || 'publication';
  if (reservedSlugs.has(base)) base = `${base}-publication`;
  let candidate = base;
  for (let suffix = 2; await exists(candidate); suffix++) {
    candidate = `${base.slice(0, 74)}-${suffix}`;
  }
  return candidate;
}
