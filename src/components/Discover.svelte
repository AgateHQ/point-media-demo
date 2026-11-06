<script lang="ts">
  import { onMount } from 'svelte';
  import { readerContext, storyVideos } from '../data';
  import { demo } from '../demo.svelte';
  import { fetchDiscoverArticles, localDiscoverArticles, shuffleDiscoverArticles, type DiscoverArticle } from '../discover';
  import { motionDelay, prefersReducedMotion, reducedMotionPreference } from '../motion';
  import Icon from './Icon.svelte';
  import ResponsiveImage from './ResponsiveImage.svelte';
  import BackgroundVideo from './BackgroundVideo.svelte';
  import PublicationLogo from './PublicationLogo.svelte';
  let { onclose, onenter }: { onclose: () => void; onenter: (article: DiscoverArticle, motion: 'down' | 'up') => void } = $props();
  const localArticles = localDiscoverArticles();
  const publicReader = readerContext.edition?.mode === 'publication';
  let articles = $state.raw(publicReader ? [] : shuffleDiscoverArticles(localArticles));
  let catalogUnavailable = $state(false);
  let index = $state(0);
  let active = $derived(articles[index]);
  let outgoing = $state('');
  let dragging = $state(false);
  let dragX = $state(0);
  let dragY = $state(0);
  let dragRotate = $state(0);
  let animationTimer = 0;
  let dragFrame = 0;

  onMount(() => {
    if (!publicReader) return;
    const controller = new AbortController();
    fetchDiscoverArticles(controller.signal).then(networkArticles => {
      if (!controller.signal.aborted) articles = shuffleDiscoverArticles([...localArticles, ...networkArticles]);
    }).catch(() => {
      if (controller.signal.aborted) return;
      catalogUnavailable = true;
      articles = shuffleDiscoverArticles(localArticles);
    });
    return () => controller.abort();
  });

  function relative(cardIndex: number) {
    let rel = cardIndex - index;
    if (rel > articles.length / 2) rel -= articles.length;
    if (rel < -articles.length / 2) rel += articles.length;
    return rel;
  }
  function resetDrag() {
    if (dragFrame) cancelAnimationFrame(dragFrame);
    dragFrame = 0;
    dragging = false;
    dragX = dragY = dragRotate = 0;
  }
  function advance(delta: number) {
    index = (index + delta + articles.length) % articles.length;
  }
  function move(delta: number) {
    if (outgoing || articles.length < 2) return;
    resetDrag();
    const delay = motionDelay(300);
    if (!delay) {
      advance(delta);
      return;
    }
    outgoing = delta > 0 ? 'swipe-out-left' : 'swipe-out-right';
    animationTimer = window.setTimeout(() => {
      animationTimer = 0;
      advance(delta);
      outgoing = '';
    }, delay);
  }
  function enter(motion: 'down' | 'up' = 'down') {
    if (outgoing || !active) return;
    resetDrag();
    outgoing = motion === 'down' && !prefersReducedMotion() ? 'enter-article' : 'opening';
    onenter(active, motion);
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
      dragging = !prefersReducedMotion();
      node.setPointerCapture(e.pointerId);
    };
    const drag = (e: PointerEvent) => {
      if (!origin || e.pointerId !== origin.id) return;
      if (prefersReducedMotion()) return;
      pointerX = e.clientX;
      pointerY = e.clientY;
      if (!dragFrame) dragFrame = requestAnimationFrame(() => {
        dragFrame = 0;
        if (!origin) return;
        dragX = pointerX - origin.x;
        dragY = Math.max(-36, pointerY - origin.y);
        dragRotate = Math.max(-13, Math.min(13, dragX / node.clientWidth * 24));
      });
    };
    const up = (e: PointerEvent) => {
      if (!origin || e.pointerId !== origin.id) return;
      const dx = e.clientX - origin.x, dy = e.clientY - origin.y;
      const elapsed = Math.max(1, performance.now() - origin.time);
      origin = null;
      if (Math.abs(dy) > Math.max(64, window.innerHeight * .09) && Math.abs(dy) > Math.abs(dx) * .72) enter(dy < 0 ? 'up' : 'down');
      else if ((Math.abs(dx) > Math.max(44, node.clientWidth * .11) || Math.abs(dx) / elapsed > .55) && Math.abs(dx) > Math.abs(dy) * .72) move(dx < 0 ? 1 : -1);
      else resetDrag();
    };
    const cancel = () => { origin = null; resetDrag(); };
    const wheel = (e: WheelEvent) => {
      if (e.ctrlKey) return;
      e.preventDefault();
      if (outgoing || !active) return;
      if (e.deltaY <= 0) { wheelDistance = 0; return; }
      const deltaMode = e.deltaMode;
      wheelDistance += e.deltaY * (deltaMode === WheelEvent.DOM_DELTA_LINE ? 16 : deltaMode === WheelEvent.DOM_DELTA_PAGE ? node.clientHeight : 1);
      window.clearTimeout(wheelTimer);
      wheelTimer = window.setTimeout(() => { wheelDistance = 0; }, 180);
      if (wheelDistance >= 90) { wheelDistance = 0; enter('up'); }
    };
    const motion = reducedMotionPreference();
    const motionChanged = () => {
      if (!motion.matches) return;
      resetDrag();
      const delta = outgoing === 'swipe-out-left' ? 1 : outgoing === 'swipe-out-right' ? -1 : 0;
      if (!delta) return;
      window.clearTimeout(animationTimer);
      animationTimer = 0;
      advance(delta);
      outgoing = '';
    };
    node.addEventListener('pointerdown', down, { passive: true });
    node.addEventListener('pointermove', drag, { passive: true });
    node.addEventListener('pointerup', up, { passive: true });
    node.addEventListener('pointercancel', cancel, { passive: true });
    node.addEventListener('wheel', wheel, { passive: false });
    motion.addEventListener('change', motionChanged);
    return { destroy() {
      window.clearTimeout(animationTimer); window.clearTimeout(wheelTimer);
      if (dragFrame) cancelAnimationFrame(dragFrame);
      node.removeEventListener('pointerdown', down); node.removeEventListener('pointermove', drag);
      node.removeEventListener('pointerup', up); node.removeEventListener('pointercancel', cancel); node.removeEventListener('wheel', wheel);
      motion.removeEventListener('change', motionChanged);
    } };
  }
  function keydown(e: KeyboardEvent) {
    if (demo.sheet !== 'discover' || !active || e.defaultPrevented || e.target instanceof HTMLSelectElement) return;
    if (e.key === 'ArrowRight') { e.preventDefault(); move(1); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); move(-1); }
    if (e.key === 'ArrowDown') { e.preventDefault(); enter(); }
    if (e.key === 'ArrowUp') { e.preventDefault(); enter('up'); }
  }
</script>

<svelte:window onkeydown={keydown} />
<div class="discover-chrome">
  {#if active}
    <span>{catalogUnavailable ? 'THIS EDITION ONLY' : 'DISCOVER'} <b>{index + 1} / {articles.length}</b></span>
  {:else}
    <span role="status">{publicReader ? 'Loading articles…' : 'No articles available'}</span>
  {/if}
  <button class="close" onclick={onclose} aria-label="Close discover">×</button>
</div>
<div class="discover-deck" aria-live="polite" use:gestures>
  {#each articles as { story, publication: p, href }, i (href || story.id)}
    {@const rel = relative(i)}
    {#if Math.abs(rel) <= 1}
      {@const activeCard = rel === 0}
      {@const title = story.title.replace(/\n/g, ' ')}
      {@const video = storyVideos[`${p.id}:${story.id}`]}
      <article class={`discover-card ${activeCard ? outgoing : ''}`} class:active={activeCard} class:dragging={activeCard && dragging}
        data-pub={p.id} data-story-id={story.id} aria-hidden={!activeCard}
        style={`--rel:${rel};--abs-rel:${Math.abs(rel)};--pub-accent:${p.brand};--pub-button-accent:${p.accent};--pub-bg:${p.color};--pub-ink:${p.ink};--pub-brand-ink:${p.brandInk};z-index:${activeCard ? 10 : 4};--drag-x:${activeCard ? dragX : 0}px;--drag-y:${activeCard ? dragY : 0}px;--drag-rotate:${activeCard ? dragRotate : 0}deg`}>
        {#if story.image}<ResponsiveImage class="discover-card-image" image={story.image} alt="" sizes="(max-width: 430px) calc(100vw - 30px), 400px" priority={activeCard ? 'high' : 'low'} />{/if}
        {#if video && activeCard}<BackgroundVideo id={video} title={`Video background for ${title}`} kind="discover" />{/if}
        <div class="discover-card-shade"></div>
        <div class="discover-card-top"><span class="discover-logo"><PublicationLogo publication={p} variant="icon" decorative /></span><span>{p.name}</span></div>
        <div class="discover-card-copy">
          {#if story.tag}<span class="discover-card-tag">{story.tag}</span>{/if}
          <h2 class="discover-card-title" title={title}>{title}</h2>
        </div>
        <div class="discover-card-bottom">
          <span>Scroll down to read</span>
          <button class="discover-select" onclick={() => enter()} disabled={!activeCard || !!outgoing} aria-label={`Read ${title}`}><span>Read article</span><span class="discover-enter-icon"><Icon /></span></button>
        </div>
      </article>
    {/if}
  {/each}
</div>
{#if articles.length > 1}
  <div class="discover-controls">
    <button onclick={() => move(-1)} aria-label="Previous article"><Icon /></button>
    <select aria-label="Jump to an article" value={index} disabled={!!outgoing}
      onchange={event => { resetDrag(); index = event.currentTarget.selectedIndex; }}>
      {#each articles as { story, publication, href }, i (href || story.id)}
        <option value={i}>{story.title.replace(/\n/g, ' ')} · {publication.name}</option>
      {/each}
    </select>
    <button onclick={() => move(1)} aria-label="Next article"><Icon /></button>
  </div>
{/if}
