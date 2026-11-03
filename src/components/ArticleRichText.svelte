<script lang="ts">
  import type { RichTextDocument, RichTextNode } from '../editionContent';
  import { contentHref } from '../readerMedia';
  import ResponsiveImage from './ResponsiveImage.svelte';
  let { document }: { document: RichTextDocument } = $props();

  function link(node: RichTextNode) {
    const fields = node.fields || {};
    const doc = fields.doc as { relationTo?: string; value?: unknown } | undefined;
    if (fields.linkType === 'internal' && doc?.relationTo) return contentHref(doc.relationTo, doc.value);
    const url = typeof fields.url === 'string' ? fields.url : '';
    return /^(https?:\/\/|mailto:|tel:|\/(?!\/)|#)/i.test(url) ? url : '#';
  }
</script>

{#snippet nodes(items: RichTextNode[])}
  {#each items as node}
    {#if node.type === 'text'}
      {@const format = typeof node.format === 'number' ? node.format : 0}
      <span class:rich-bold={!!(format & 1)} class:rich-italic={!!(format & 2)} class:rich-strike={!!(format & 4)} class:rich-underline={!!(format & 8)} class:rich-code={!!(format & 16)} class:rich-sub={!!(format & 32)} class:rich-sup={!!(format & 64)}>{node.text || ''}</span>
    {:else if node.type === 'paragraph'}
      <p class="body-copy" style:text-align={['left', 'right', 'center', 'justify'].includes(String(node.format)) ? String(node.format) : undefined}>{@render nodes(node.children || [])}</p>
    {:else if node.type === 'heading'}
      <svelte:element this={['h1','h2','h3','h4','h5','h6'].includes(node.tag || '') ? node.tag! : 'h2'}>{@render nodes(node.children || [])}</svelte:element>
    {:else if node.type === 'quote'}
      <blockquote class="article-pullquote">{@render nodes(node.children || [])}</blockquote>
    {:else if node.type === 'list'}
      <svelte:element this={node.listType === 'number' ? 'ol' : 'ul'} class="rich-list" start={node.listType === 'number' ? node.start : undefined}>
        {@render nodes(node.children || [])}
      </svelte:element>
    {:else if node.type === 'listitem'}
      <li>{#if typeof node.checked === 'boolean'}<span aria-label={node.checked ? 'Checked' : 'Unchecked'}>{node.checked ? '☑' : '☐'} </span>{/if}{@render nodes(node.children || [])}</li>
    {:else if node.type === 'link' || node.type === 'autolink'}
      <a href={link(node)} target={node.fields?.newTab ? '_blank' : undefined} rel={node.fields?.newTab ? 'noopener noreferrer' : undefined}>{@render nodes(node.children || [])}</a>
    {:else if node.type === 'linebreak'}<br />
    {:else if node.type === 'horizontalrule'}<hr />
    {:else if node.type === 'upload'}
      {@const media = node.value && typeof node.value === 'object' ? node.value as { url?: string; alt?: string } : null}
      {#if media?.url}<figure class="rich-image"><ResponsiveImage image={media.url} alt={media.alt || ''} class="article-image" loading="lazy" /></figure>{/if}
    {:else if node.type === 'relationship'}
      <p class="body-copy"><a href={contentHref(node.relationTo || '', node.value)}>View related content →</a></p>
    {:else if node.type === 'table'}
      <div class="rich-table"><table><tbody>{@render nodes(node.children || [])}</tbody></table></div>
    {:else if node.type === 'tablerow'}<tr>{@render nodes(node.children || [])}</tr>
    {:else if node.type === 'tablecell'}<td>{@render nodes(node.children || [])}</td>
    {:else if node.children}{@render nodes(node.children)}{/if}
  {/each}
{/snippet}

<div class="article-rich-text">{@render nodes(document.root.children || [])}</div>
