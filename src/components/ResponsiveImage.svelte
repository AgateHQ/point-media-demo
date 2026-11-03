<script lang="ts">
  import assets from '../image-assets.json';
  import { asset } from '../data';
  import { fadeImage } from '../media';
  let { image, alt, class: className = '', sizes = '(max-width: 430px) 100vw, 430px', priority = 'auto', loading = 'eager' }: {
    image: string;
    alt: string;
    class?: string;
    sizes?: string;
    priority?: 'high' | 'low' | 'auto';
    loading?: 'eager' | 'lazy';
  } = $props();
  let metadata = $derived(assets[image as keyof typeof assets]);
  let srcset = $derived(metadata?.variants.map(variant => `${asset(`optimized/${variant.file}`)} ${variant.width}w`).join(', '));
</script>

{#if image}
  <picture>
    {#if srcset}<source type="image/webp" {srcset} {sizes} />{/if}
    <img class={className} src={metadata ? asset(`${image}.jpg`) : image} {alt} {loading} decoding="async" fetchpriority={priority} draggable="false"
      width={metadata?.width} height={metadata?.height} use:fadeImage />
  </picture>
{:else}
  <div class={`media-placeholder ${className}`} aria-hidden="true"><span>▶</span></div>
{/if}
