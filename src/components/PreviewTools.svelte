<script lang="ts">
  import { readerContext } from '../data';
  import { reset, selectPublication } from '../demo.svelte';
  const preview = readerContext.preview!;
</script>

<aside class="editor-preview-toolbar" aria-label="Edition preview controls">
  <div><strong>Saved edition preview · {preview.publication.name}</strong><span>Reader interactions and wallet are simulated in a separate preview session.</span></div>
  <nav aria-label="Preview actions">
    <button onclick={() => selectPublication(readerContext.publicationId)}>This edition</button>
    <button onclick={reset}>Reset preview</button>
    <button onclick={() => window.location.reload()}>Refresh</button>
    <a href={`/admin/collections/editions/${preview.id}`}>Edit edition ↗</a>
  </nav>
</aside>
