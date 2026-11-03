<script lang="ts">
  import { previewVideo } from '../readerMedia';
  let { url, title }: { url: string; title: string } = $props();
  let video = $derived(previewVideo(url));
</script>

{#if video?.type === 'embed'}
  <iframe class="cms-story-video" src={video.url} title={title} allow="fullscreen; picture-in-picture" allowfullscreen></iframe>
{:else if video?.type === 'file'}
  <!-- The uploaded video URL does not currently have a caption-track field. -->
  <!-- svelte-ignore a11y_media_has_caption -->
  <video class="cms-story-video" src={video.url} controls playsinline preload="metadata"></video>
{:else if video}
  <a class="cms-video-link" href={video.url} target="_blank" rel="noopener noreferrer">Watch video ↗</a>
{/if}
