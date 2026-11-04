<script lang="ts">
  import { publicationLogo, type Publication } from '../data';
  let { publication, variant = 'colour', class: className = '', decorative = false }: {
    publication: Publication;
    variant?: 'colour' | 'white' | 'icon';
    class?: string;
    decorative?: boolean;
  } = $props();
</script>

{#if publication.theme && !publication.logoUrl}
  <span class={`publication-logo publication-logo-fallback ${className}`} aria-hidden={decorative ? true : undefined}>{variant === 'icon' ? publication.name.slice(0, 1) : publication.name}</span>
{:else}
  <img class={`publication-logo ${className}`} src={publicationLogo(publication, variant)} alt={decorative ? '' : publication.name} decoding="async" draggable="false" />
{/if}
