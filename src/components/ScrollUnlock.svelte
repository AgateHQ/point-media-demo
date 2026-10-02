<script lang="ts">
  import { onMount } from 'svelte';
  import { demo, ensureBalance, expand } from '../demo.svelte';
  let { storyId, accent }: { storyId: string; accent: string } = $props();
  let zone: HTMLElement;
  let boundary: HTMLSpanElement;
  let progress = $state(0);
  let opening = $state(false);
  let toppedUp = $state(false);
  let status = $derived(opening ? (toppedUp ? 'Opening full story next' : 'Charging 20p to your wallet')
    : progress > .72 ? 'Opening full story · 20p' : progress > .15 ? '20p charge approaching' : 'Scroll to continue');

  onMount(() => {
    let initialScroll = window.scrollY;
    let frame = 0;
    let timer = 0;
    const content = zone.closest<HTMLElement>('.story-content')!;
    let geometryDirty = true;
    let start = 0;
    let end = 0;
    let minimumScroll = 240;
    const update = () => {
      frame = 0;
      if (demo.sheet) {
        if (timer) window.clearTimeout(timer);
        timer = 0;
        opening = false;
        return;
      }
      if (opening) return;
      if (geometryDirty) {
        const visibleBottom = window.innerHeight - zone.getBoundingClientRect().height;
        start = content.getBoundingClientRect().top + window.scrollY - visibleBottom;
        end = boundary.getBoundingClientRect().top + window.scrollY - visibleBottom;
        minimumScroll = Math.max(240, window.innerHeight * .45);
        geometryDirty = false;
      }
      initialScroll = Math.min(initialScroll, window.scrollY);
      progress = Math.max(0, Math.min(1,
        (window.scrollY - start) / Math.max(1, end - start),
        (window.scrollY - initialScroll) / minimumScroll));
      if (progress < 1) return;
      opening = true;
      toppedUp = ensureBalance();
      timer = window.setTimeout(() => {
        timer = 0;
        if (demo.sheet) { opening = false; return; }
        expand(storyId);
      }, toppedUp ? 1050 : 650);
    };
    const requestUpdate = () => { if (!frame) frame = requestAnimationFrame(update); };
    const geometryChanged = () => { geometryDirty = true; requestUpdate(); };
    const observer = new ResizeObserver(geometryChanged);
    observer.observe(content);
    observer.observe(zone);
    window.addEventListener('scroll', requestUpdate, { passive: true });
    window.addEventListener('resize', geometryChanged, { passive: true });
    document.addEventListener('demo-sheet-change', geometryChanged);
    content.addEventListener('animationend', geometryChanged);
    requestUpdate();
    return () => {
      window.removeEventListener('scroll', requestUpdate);
      window.removeEventListener('resize', geometryChanged);
      document.removeEventListener('demo-sheet-change', geometryChanged);
      content.removeEventListener('animationend', geometryChanged);
      observer.disconnect();
      if (frame) cancelAnimationFrame(frame);
      if (timer) window.clearTimeout(timer);
    };
  });
</script>

<span bind:this={boundary} class="unlock-boundary" aria-hidden="true"></span>
<footer bind:this={zone} class="scroll-unlock" class:unlocking={opening} data-story={storyId}
  role="progressbar" aria-label="Full article opens automatically for 20 pence" aria-valuemin="0" aria-valuemax="100" aria-valuenow={Math.round(progress * 100)}
  style={`--unlock-accent:${accent};--unlock-progress:${progress}`}>
  <strong>{opening ? (toppedUp ? 'Demo balance topped up' : 'Opening full story') : 'Full story · 20p'}</strong>
  <small>Keep scrolling to unlock · charged automatically</small>
  <span class="scroll-unlock-track" aria-hidden="true"><i></i></span>
  <span class="scroll-unlock-status">{status}</span>
</footer>
