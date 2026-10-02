<script lang="ts">
  import { publications, stories, initials, storyVideos } from '../data';
  import imageAssets from '../image-assets.json';
  import { demo } from '../demo.svelte';
  import Icon from './Icon.svelte';
  import ResponsiveImage from './ResponsiveImage.svelte';
  import BackgroundVideo from './BackgroundVideo.svelte';
  let { onclose, onenter }: { onclose: () => void; onenter: (id: string, motion?: 'down' | 'up') => void } = $props();
  let active = $derived(publications[demo.discoverIndex]);
  let outgoing = $state('');
  let dragging = $state(false);
  let dragX = $state(0);
  let dragY = $state(0);
  let dragRotate = $state(0);
  let animationTimer = 0;
  let dragFrame = 0;
  function relative(index: number) {
    let rel = index - demo.discoverIndex;
    if (rel > publications.length / 2) rel -= publications.length;
    if (rel < -publications.length / 2) rel += publications.length;
    return rel;
  }
  function resetDrag() {
    if (dragFrame) cancelAnimationFrame(dragFrame);
    dragFrame = 0;
    dragging = false;
    dragX = dragY = dragRotate = 0;
  }
  function move(delta: number) {
    if (outgoing) return;
    resetDrag();
    outgoing = delta > 0 ? 'swipe-out-left' : 'swipe-out-right';
    animationTimer = window.setTimeout(() => {
      demo.discoverIndex = (demo.discoverIndex + delta + publications.length) % publications.length;
      outgoing = '';
    }, 300);
  }
  function enter(motion: 'down' | 'up' = 'down') {
    if (outgoing) return;
    resetDrag();
    outgoing = motion === 'down' ? 'enter-publication' : '';
    onenter(active.id, motion);
  }
  function gestures(node: HTMLElement) {
    let origin: { x: number; y: number; id: number; time: number } | null = null;
    let wheelDistance = 0;
    let wheelTimer = 0;
    let pointerX = 0;
    let pointerY = 0;
    const down = (e: PointerEvent) => {
      if (outgoing || !(e.target instanceof Element) || e.target.closest('button,a,input,select,textarea')) return;
      origin = { x: e.clientX, y: e.clientY, id: e.pointerId, time: performance.now() };
      dragging = true;
      node.setPointerCapture(e.pointerId);
    };
    const drag = (e: PointerEvent) => {
      if (!origin || e.pointerId !== origin.id) return;
      pointerX = e.clientX;
      pointerY = e.clientY;
      if (!dragFrame) dragFrame = requestAnimationFrame(() => {
        dragFrame = 0;
        if (!origin) return;
        dragX = pointerX - origin.x;
        dragY = Math.max(-36, pointerY - origin.y);
        dragRotate = Math.max(-13, Math.min(13, dragX / window.innerWidth * 24));
      });
    };
    const up = (e: PointerEvent) => {
      if (!origin || e.pointerId !== origin.id) return;
      const dx = e.clientX - origin.x, dy = e.clientY - origin.y;
      const elapsed = Math.max(1, performance.now() - origin.time);
      origin = null;
      if (Math.abs(dy) > Math.max(64, window.innerHeight * .09) && Math.abs(dy) > Math.abs(dx) * .72) enter(dy < 0 ? 'up' : 'down');
      else if ((Math.abs(dx) > Math.max(44, window.innerWidth * .11) || Math.abs(dx) / elapsed > .55) && Math.abs(dx) > Math.abs(dy) * .72) move(dx < 0 ? 1 : -1);
      else resetDrag();
    };
    const cancel = () => { origin = null; resetDrag(); };
    const wheel = (e: WheelEvent) => {
      e.preventDefault();
      if (outgoing) return;
      wheelDistance += Math.abs(e.deltaY);
      window.clearTimeout(wheelTimer);
      wheelTimer = window.setTimeout(() => { wheelDistance = 0; }, 180);
      if (wheelDistance >= 90) { wheelDistance = 0; enter('up'); }
    };
    node.addEventListener('pointerdown', down, { passive: true });
    node.addEventListener('pointermove', drag, { passive: true });
    node.addEventListener('pointerup', up, { passive: true });
    node.addEventListener('pointercancel', cancel, { passive: true });
    node.addEventListener('wheel', wheel, { passive: false });
    return { destroy() {
      window.clearTimeout(animationTimer); window.clearTimeout(wheelTimer);
      if (dragFrame) cancelAnimationFrame(dragFrame);
      node.removeEventListener('pointerdown', down); node.removeEventListener('pointermove', drag);
      node.removeEventListener('pointerup', up); node.removeEventListener('pointercancel', cancel); node.removeEventListener('wheel', wheel);
    } };
  }
  function keydown(e: KeyboardEvent) {
    if (!demo.sheet || demo.sheet !== 'discover') return;
    if (e.key === 'ArrowRight') { e.preventDefault(); move(1); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); move(-1); }
    if (e.key === 'ArrowDown') { e.preventDefault(); enter(); }
    if (e.key === 'ArrowUp') { e.preventDefault(); enter('up'); }
  }
</script>

<svelte:window onkeydown={keydown} />
<div class="discover-chrome"><span>DISCOVER <b>{String(demo.discoverIndex + 1).padStart(2, '0')} / {String(publications.length).padStart(2, '0')}</b></span><button class="close" onclick={onclose} aria-label="Close discover">×</button></div>
<div class="discover-deck" aria-live="polite" use:gestures>
  {#each publications as p, i (p.id)}
    {@const rel = relative(i)}
    {@const activeCard = rel === 0}
    {@const feature = stories[p.storyOrder[0]]}
    <article class={`discover-card ${activeCard ? outgoing : ''}`} class:active={activeCard} class:dragging={activeCard && dragging}
      data-pub={p.id} aria-hidden={!activeCard}
      style={`--rel:${rel};--abs-rel:${Math.abs(rel)};--pub-accent:${p.brand};--pub-bg:${p.color};--pub-ink:${p.ink};--pub-brand-ink:${p.brandInk};z-index:${activeCard ? 10 : 5 - Math.abs(rel)};--drag-x:${activeCard ? dragX : 0}px;--drag-y:${activeCard ? dragY : 0}px;--drag-rotate:${activeCard ? dragRotate : 0}deg`}>
      <ResponsiveImage class="discover-card-image" image={feature.image as keyof typeof imageAssets} alt="" sizes="100vw" priority={activeCard ? 'high' : 'low'} />
      {#if p.id === 'pulse' && activeCard}<BackgroundVideo id={storyVideos['pulse:life']} title={`Video background for ${p.name}`} kind="discover" />{/if}
      <div class="discover-card-shade"></div>
      <div class="discover-card-top"><span class="discover-logo" style={`background:${p.color};border-color:${p.brand};color:${p.ink}`}>{initials(p.name)}</span><span>{activeCard && p.id === demo.data.publication ? 'CURRENT EDITION' : 'AXATE PUBLICATION'}</span></div>
      <div class="discover-card-copy"><span class="discover-card-tag">{feature.tag}</span><div class="discover-card-name">{p.name}<span style:color={p.brand}>.</span></div></div>
      <div class="discover-card-bottom"><strong>{p.subtitle}</strong><button class="discover-select" onclick={() => enter()} disabled={!activeCard || !!outgoing} aria-label={`Swipe down to open ${p.name}`}><span>Swipe Down</span><span class="discover-enter-icon"><Icon /></span></button></div>
    </article>
  {/each}
</div>
<div class="discover-controls">
  <button onclick={() => move(-1)} aria-label="Previous publication"><Icon /></button>
  <div class="discover-dots" aria-label={active.name}>{#each publications as p, i}<span class:active={i === demo.discoverIndex} style:background={i === demo.discoverIndex ? p.brand : undefined}></span>{/each}</div>
  <button onclick={() => move(1)} aria-label="Next publication"><Icon /></button>
</div>
