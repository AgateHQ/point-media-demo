<script lang="ts">
  import { onMount } from 'svelte';
  import { demo } from '../demo.svelte';
  import { youtubeEmbed } from '../data';
  let { id, title, kind = 'story' }: { id: string; title: string; kind?: 'story' | 'discover' } = $props();
  let container: HTMLDivElement;
  let frame = $state<HTMLIFrameElement>();
  let visible = $state(false);
  let pageVisible = $state(!document.hidden);
  let allowed = $state(false);
  let loaded = $state(false);
  let ready = $state(false);
  let playing = $state(false);
  let unavailable = $state(false);
  let fallbackTimer = 0;
  let playerId = $derived(kind === 'story' ? 'article-video' : `discover-video-${id}`);
  let shouldPlay = $derived(allowed && visible && pageVisible && (kind === 'discover' || !demo.sheet));
  function send(func: string) { frame?.contentWindow?.postMessage(JSON.stringify({ event: 'command', func, args: [] }), '*'); }
  function listen() {
    frame?.contentWindow?.postMessage(JSON.stringify({ event: 'listening', id: playerId }), '*');
    window.clearTimeout(fallbackTimer);
    fallbackTimer = window.setTimeout(() => { if (!playing && shouldPlay) unavailable = true; }, 6000);
  }
  $effect(() => { if (shouldPlay) loaded = true; });
  $effect(() => {
    if (!frame || !ready) return;
    send('mute');
    send(shouldPlay ? 'playVideo' : 'pauseVideo');
  });
  onMount(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    const preferencesChanged = () => { allowed = !reducedMotion.matches && !connection?.saveData; };
    const visibilityChanged = () => { pageVisible = !document.hidden; };
    const observer = new IntersectionObserver(entries => { visible = entries[0].isIntersecting; }, { threshold: .01 });
    observer.observe(container);
    preferencesChanged();
    const onMessage = (event: MessageEvent) => {
      if (!frame || event.source !== frame.contentWindow) return;
      try {
        const message = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        if (message.event === 'onReady') ready = true;
        if (message.event === 'infoDelivery' && message.info?.playerState === 1) {
          ready = true;
          playing = true;
          window.clearTimeout(fallbackTimer);
          if (!shouldPlay) send('pauseVideo');
        }
        if (message.event === 'onError') unavailable = true;
      } catch { /* Ignore unrelated player messages. */ }
    };
    window.addEventListener('message', onMessage);
    document.addEventListener('visibilitychange', visibilityChanged);
    reducedMotion.addEventListener('change', preferencesChanged);
    return () => {
      observer.disconnect();
      window.removeEventListener('message', onMessage);
      document.removeEventListener('visibilitychange', visibilityChanged);
      reducedMotion.removeEventListener('change', preferencesChanged);
      window.clearTimeout(fallbackTimer);
    };
  });
</script>

<div bind:this={container} class={kind === 'story' ? 'story-video' : 'discover-video'} class:playing class:unavailable aria-hidden="true">
  {#if loaded && allowed && !unavailable}
    <iframe bind:this={frame} class={kind === 'discover' ? 'discover-card-video' : undefined} id={playerId} src={youtubeEmbed(id)} {title}
      allow="autoplay; encrypted-media" referrerpolicy="origin" tabindex="-1" onload={listen}></iframe>
  {/if}
</div>
