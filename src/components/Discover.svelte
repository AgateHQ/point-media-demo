<script lang="ts">
  import { onMount } from 'svelte';
  import { readerContext } from '../data';
  import { demo } from '../demo.svelte';
  import { discoverPublications, discoverVideoId, fetchDiscoverArticles, localDiscoverArticles, shuffleDiscoverArticles, type DiscoverArticle, type DiscoverPublication } from '../discover';
  import { motionDelay, prefersReducedMotion, reducedMotionPreference } from '../motion';
  import Icon from './Icon.svelte';
  import ResponsiveImage from './ResponsiveImage.svelte';
  import BackgroundVideo from './BackgroundVideo.svelte';
  import PublicationLogo from './PublicationLogo.svelte';
  import PublicationBookshelf from './PublicationBookshelf.svelte';
  let { onclose, onenter }: { onclose: () => void; onenter: (article: DiscoverArticle, motion: 'down' | 'up') => void } = $props();
  const localArticles = localDiscoverArticles();
  const publicReader = readerContext.edition?.mode === 'publication';
  let articles = $state.raw(publicReader ? [] : shuffleDiscoverArticles(localArticles));
  let networkArticles = $state.raw<DiscoverArticle[]>([]);
  let editions = $derived(discoverPublications(networkArticles));
  let showingBookshelf = $state(false);
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
    fetchDiscoverArticles(controller.signal).then(loadedArticles => {
      if (controller.signal.aborted) return;
      networkArticles = loadedArticles;
      articles = shuffleDiscoverArticles([...localArticles, ...loadedArticles]);
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
  function toggleBookshelf() {
    if (outgoing) return;
    resetDrag();
    showingBookshelf = !showingBookshelf;
  }
  function enterPublication(edition: DiscoverPublication) {
    if (outgoing) return;
    resetDrag();
    outgoing = 'opening';
    onenter({ story: edition.lead, publication: edition.publication, href: edition.href }, 'up');
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
    if (demo.sheet !== 'discover' || showingBookshelf || !active || e.defaultPrevented || e.target instanceof HTMLSelectElement) return;
    if (e.key === 'ArrowRight') { e.preventDefault(); move(1); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); move(-1); }
    if (e.key === 'ArrowDown') { e.preventDefault(); enter(); }
    if (e.key === 'ArrowUp') { e.preventDefault(); enter('up'); }
  }
</script>

<svelte:window onkeydown={keydown} />
<div class="discover-chrome" class:bookshelf-chrome={showingBookshelf}>
  {#if showingBookshelf || active}
    <span>{catalogUnavailable ? 'THIS EDITION ONLY' : 'DISCOVER'}</span>
  {:else}
    <span role="status">{publicReader ? 'Loading articles…' : 'No articles available'}</span>
  {/if}
  <div class="discover-chrome-actions">
    <button class="discover-bookshelf-button" onclick={toggleBookshelf} disabled={!!outgoing} aria-label={showingBookshelf ? 'Back to articles' : 'Browse publication bookshelf'}>
      {#if showingBookshelf}<span class="bookshelf-back-icon"><Icon /></span><span>Articles</span>{:else}<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><path d="M3 4h4v11H3zM8 3h4v12H8zM13 5l3-1 3 10-3 1zM2 17h17" /></svg><span>Bookshelf</span>{/if}
    </button>
    <button class="close" onclick={onclose} aria-label="Close discover">×</button>
  </div>
</div>
{#if showingBookshelf}
  <PublicationBookshelf {editions} disabled={!!outgoing} onselect={enterPublication} />
{:else}
<div class="discover-deck" aria-live="polite" use:gestures>
  {#each articles as { story, publication: p, href }, i (`${href || story.id}:${i}`)}
    {@const rel = relative(i)}
    {#if Math.abs(rel) <= 1}
      {@const activeCard = rel === 0}
      {@const title = story.title.replace(/\n/g, ' ')}
      {@const video = discoverVideoId({ story, publication: p })}
      <article class={`discover-card ${activeCard ? outgoing : ''}`} class:active={activeCard} class:dragging={activeCard && dragging}
        data-pub={p.id} data-story-id={story.id} data-media={video ? 'video' : 'image'} aria-hidden={!activeCard}
        style={`--rel:${rel};--abs-rel:${Math.abs(rel)};--pub-accent:${p.brand};--pub-button-accent:${p.accent};--pub-bg:${p.color};--pub-ink:${p.ink};--pub-brand-ink:${p.brandInk};z-index:${activeCard ? 10 : 4};--drag-x:${activeCard ? dragX : 0}px;--drag-y:${activeCard ? dragY : 0}px;--drag-rotate:${activeCard ? dragRotate : 0}deg`}>
        {#if !video && story.image}<ResponsiveImage class="discover-card-image" image={story.image} alt="" sizes="(max-width: 430px) calc(100vw - 30px), 400px" priority={activeCard ? 'high' : 'low'} />{/if}
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
      {#each articles as { story, publication, href }, i (`${href || story.id}:${i}`)}
        <option value={i}>{story.title.replace(/\n/g, ' ')} · {publication.name}</option>
      {/each}
    </select>
    <button onclick={() => move(1)} aria-label="Next article"><Icon /></button>
  </div>
{/if}
{/if}

<style>
  .discover-chrome-actions { display: flex; align-items: center; gap: 10px; }
  .discover-bookshelf-button { display: flex; align-items: center; justify-content: center; gap: 7px; min-height: 40px; padding: 9px 12px; border: 1px solid #ffffff55; border-radius: 999px; background: #050605d9; color: #fff; backdrop-filter: blur(16px); pointer-events: auto; font: 700 .6875rem/1.1 'DM Sans', sans-serif; }
  .discover-bookshelf-button > svg, .bookshelf-back-icon :global(svg) { width: 16px; height: 16px; }
  .bookshelf-back-icon { display: flex; transform: rotate(180deg); }
  .bookshelf-chrome > span { padding: 0; border: 0; background: transparent; backdrop-filter: none; color: #666; font-size: 9px; letter-spacing: 2px; }
  .bookshelf-chrome .discover-bookshelf-button { border-color: #0000001a; background: transparent; color: #555; backdrop-filter: none; }
  .bookshelf-chrome .close { border-color: transparent; background: transparent; color: #555; backdrop-filter: none; }
  @media (max-width: 360px) { .discover-chrome-actions { gap: 7px; } .discover-bookshelf-button { padding: 9px 10px; } }
</style>
