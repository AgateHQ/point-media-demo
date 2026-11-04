type Lookup = (collection: 'publications' | 'media', id: string | number) => Promise<unknown>;

export function object(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function id(value: unknown): string | number | undefined {
  const candidate = value && typeof value === 'object' ? object(value).id : value;
  return typeof candidate === 'number' || typeof candidate === 'string' && candidate.length > 0 ? candidate : undefined;
}

// Payload's form sends relationship IDs; populate them without saving the edition.
export async function populateLiveEdition(value: unknown, lookup: Lookup) {
  async function relation(collection: 'publications' | 'media', value: unknown) {
    const key = id(value);
    return key === undefined ? value : await lookup(collection, key) || value;
  }
  async function node(value: unknown): Promise<unknown> {
    const item = object(value);
    if (!item.type) return value;
    const result = { ...item };
    if (Array.isArray(item.children)) result.children = await Promise.all(item.children.map(node));
    if (item.type === 'upload' && item.relationTo === 'media') result.value = await relation('media', item.value);
    const fields = object(item.fields);
    const doc = object(fields.doc);
    if ((item.type === 'link' || item.type === 'autolink') && doc.relationTo === 'media') {
      result.fields = { ...fields, doc: { ...doc, value: await relation('media', doc.value) } };
    }
    return result;
  }
  const edition = object(value);
  return {
    ...edition,
    publication: await relation('publications', edition.publication),
    articles: await Promise.all((Array.isArray(edition.articles) ? edition.articles : []).map(async value => {
      const article = object(value);
      return {
        ...article,
        mainImage: article.mediaType === 'image' ? await relation('media', article.mainImage) : article.mainImage,
        body: { ...object(article.body), root: await node(object(article.body).root) },
      };
    })),
  };
}
