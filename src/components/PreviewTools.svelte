<script lang="ts">
  import { readerContext } from '../data';
  import { reset, selectPublication } from '../demo.svelte';
  import { readerRuntime } from '../readerRuntime.svelte';
  let preview = $derived.by(() => { readerRuntime.revision; return readerContext.preview!; });
</script>

<aside class="editor-preview-toolbar" aria-label="Edition preview controls">
  <div><strong>{preview.live ? 'Live preview' : 'Saved edition preview'} · {preview.publication.name}</strong><span>{preview.live ? 'Unsaved changes · Full articles shown as you write.' : 'Reader interactions and wallet are simulated in a separate preview session.'}</span></div>
  <nav aria-label="Preview actions">
    {#if preview.live}
      {#if preview.id}<a href={`/preview/editions/${preview.id}`} target="_blank" rel="noopener noreferrer">Open saved preview ↗</a>{/if}
    {:else}
    <button onclick={() => selectPublication(readerContext.publicationId)}>This edition</button>
    <button onclick={reset}>Reset preview</button>
    <button onclick={() => window.location.reload()}>Refresh</button>
    <a href={`/admin/collections/editions/${preview.id}`}>Edit edition ↗</a>
    {/if}
  </nav>
</aside>
