// The CMS and the Svelte reader share this serializable content contract.
export interface RichTextNode {
  type: string;
  version?: number;
  children?: RichTextNode[];
  text?: string;
  format?: number | string;
  tag?: string;
  listType?: string;
  start?: number;
  checked?: boolean;
  fields?: Record<string, unknown>;
  relationTo?: string;
  value?: unknown;
  [key: string]: unknown;
}
export interface RichTextDocument { root: RichTextNode; }
export interface EditionContent {
  id: number;
  publication: { id: number; name: string; headline: string; logoUrl?: string };
  startDate: string;
  endDate: string;
  articles: {
    id: string;
    title: string;
    body: RichTextDocument;
    imageUrl?: string;
    imageAlt?: string;
    videoUrl?: string;
  }[];
}

export function richTextText(node: RichTextNode): string {
  if (node.type === 'text') return node.text || '';
  const separator = ['root', 'list', 'table', 'tablerow'].includes(node.type) ? '\n\n' : '';
  return (node.children || []).map(richTextText).join(separator);
}

// Keep the editor's structure and formatting when showing the paid preview.
export function richTextPreview(document: RichTextDocument): RichTextDocument {
  let remaining = Math.max(1, Math.floor(richTextText(document.root).replace(/\n/g, '').length * .4));
  function trim(node: RichTextNode): RichTextNode | null {
    if (remaining <= 0) return null;
    if (node.type === 'text') {
      const text = (node.text || '').slice(0, remaining);
      remaining -= text.length;
      return { ...node, text };
    }
    if (!node.children) return { ...node };
    return { ...node, children: node.children.map(trim).filter((child): child is RichTextNode => child !== null) };
  }
  return { root: trim(document.root) || { ...document.root, children: [] } };
}

export function editionNavigation(total: number) {
  const partner = total > 1 ? Math.ceil(total / 2) : -1;
  const last = Math.max(0, total - 1 + (partner >= 0 ? 1 : 0));
  return {
    partner, last,
    storyIndex: (position: number) => position > partner && partner >= 0 ? position - 1 : position,
    storyPosition: (index: number) => index >= partner && partner >= 0 ? index + 1 : index,
  };
}
