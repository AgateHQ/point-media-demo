<script lang="ts">
  import { publicationLogo, type Publication } from '../data';
  let { publication, variant = 'colour', class: className = '', decorative = false }: {
    publication: Publication;
    variant?: 'colour' | 'white' | 'icon';
    class?: string;
    decorative?: boolean;
  } = $props();
</script>

<img class={`publication-logo ${className}`} src={publicationLogo(publication, variant)} alt={decorative ? '' : publication.name} decoding="async" draggable="false" />
