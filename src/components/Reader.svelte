<script lang="ts">
  import { onMount, untrack } from 'svelte';
  import { demo, currentPub, getStories, storyIndex, pubExpanded, pubCollected, halfwayProgress, collect, home, claim, move, openSheet } from '../demo.svelte';
  import { articlePreview, storyVideos, storySections } from '../data';
  import imageAssets from '../image-assets.json';
  import { readerIsAtBottom } from '../gestures';
  import Icon from './Icon.svelte';
  import BackgroundVideo from './BackgroundVideo.svelte';
  import ScrollUnlock from './ScrollUnlock.svelte';
  import ResponsiveImage from './ResponsiveImage.svelte';
  import EditionCard from './EditionCard.svelte';
  import HalfwayMoment from './HalfwayMoment.svelte';
  import FinalArticleMoment from './FinalArticleMoment.svelte';

  let pub = $derived(currentPub());
  let index = $derived(storyIndex());
  let story = $derived(getStories()[index]);
  let ad = $derived(demo.data.position === 4);
  let expanded = $derived(pubExpanded().includes(story.id));
  let collected = $derived(pubCollected().includes(story.id));
  let collectedCount = $derived(getStories().filter(item => pubCollected().includes(item.id)).length);
  let finalArticle = $derived(!ad && index === getStories().length - 1);
  let halfway = $derived(halfwayProgress());
  const halfwayOnArrival = untrack(() => halfway.reached);
  let pauseForHalfway = $derived(!ad && index === halfway.target - 1 && halfway.reached && !halfwayOnArrival);
  let videoId = $derived(!ad ? storyVideos[`${pub.id}:${story.id}`] : '');
  let parts = $derived((expanded ? story.expandedBody : articlePreview(story)).split('\n\n'));
  let section = $derived(storySections[story.id] || 'News');

  onMount(() => {
    if (!ad || demo.data.reward) return;
    const timer = window.setTimeout(claim, 700);
    return () => window.clearTimeout(timer);
  });

  $effect(() => {
    if ((ad ? !demo.data.reward : !expanded) || pauseForHalfway) return;
    let frame = 0;
    let timer = 0;
    const clearTimer = () => { if (timer) window.clearTimeout(timer); timer = 0; };
    const update = () => {
      frame = 0;
      if (demo.sheet || !readerIsAtBottom()) { clearTimer(); return; }
      if (!ad) collect(story.id);
      // The last story ends at a deliberate finish line. The reader chooses
      // when to open the unlocked preview instead of being hurried into it.
      if (finalArticle) { clearTimer(); return; }
      // Let a newly earned midpoint breathe. Continue, swipe, and arrow-key
      // navigation remain available; revisits keep normal auto-advancement.
      if (pauseForHalfway) { clearTimer(); return; }
      if (!timer) timer = window.setTimeout(() => {
        timer = 0;
        if (!demo.sheet && readerIsAtBottom()) move(1);
      }, ad ? 2600 : 1800);
    };
    const requestUpdate = () => { if (!frame) frame = requestAnimationFrame(update); };
    window.addEventListener('scroll', requestUpdate, { passive: true });
    window.addEventListener('resize', requestUpdate, { passive: true });
    document.addEventListener('demo-sheet-change', requestUpdate);
    requestUpdate();
    return () => {
      clearTimer();
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener('scroll', requestUpdate);
      window.removeEventListener('resize', requestUpdate);
      document.removeEventListener('demo-sheet-change', requestUpdate);
    };
  });
</script>

{#if ad}
  <section class="story-visual sponsored-visual">
    <ResponsiveImage class="story-image" image="20260603-R0000419" alt="Sponsored content" priority="high" />
    <div class="image-shade"></div>
    <div class="reader-top">
      <div class="reader-meta"><button onclick={home} aria-label="Back to first article" class="back-arrow"><Icon /></button><span>PARTNER MOMENT</span></div>
    </div>
    <div class="story-visual-copy"><span class="pill">SPONSORED</span><h1>Good nights.<br /><em>Good rewards.</em></h1><span class="story-scroll-cue" aria-hidden="true"><Icon /></span></div>
  </section>
  <article class="story-content sponsored">
    <p>Your next great night starts with a little something back. Enjoy 10p on us, straight to your wallet.</p>
    <div class="reward-status" aria-live="polite" style={`--reward-accent:${pub.accent}`}>{demo.data.reward ? '✓ 10p added to your wallet' : 'Adding 10p to your wallet…'}</div>
    <small>A fictional partner. A simulated reward. No purchase needed.</small>
  </article>
{:else}
  <article class="story-content article-page" class:expanded data-story-id={story.id}>
    <div class="article-tools">
      <button onclick={home} class="article-back" aria-label="Back to first article"><Icon /><span>First article</span></button>
      <button class="article-set-button" onclick={() => openSheet('collection')} aria-label={`View your daily set, ${collectedCount} of ${getStories().length} cards collected`}>
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><rect x="3" y="3" width="5" height="6" rx=".5" /><rect x="12" y="3" width="5" height="6" rx=".5" /><rect x="3" y="12" width="5" height="5" rx=".5" /><rect x="12" y="12" width="5" height="5" rx=".5" /></svg>
        <span>Your set</span><strong>{collectedCount} / {getStories().length}</strong>
      </button>
    </div>
    <EditionCard {story} number={index + 1} total={getStories().length} {collected}>
    <header class="article-head">
      <div class="article-kicker">
        <span class="article-label">{#if pub.id === 'the-scoop'}<span aria-hidden="true">★</span>{/if}{story.tag}</span>
        <span class="article-section">{section}</span>
      </div>
      <h1>{story.title.replace(/\n/g, ' ')}</h1>
      <p class="standfirst">{story.subtitle}</p>
      <div class="article-byline"><span><strong>By {pub.name} team</strong><span class="byline-desk"> · {section}</span></span><time datetime="2026-09-16">16 September 2026</time></div>
    </header>
    <figure class="article-figure">
      <div class="article-media">
        <ResponsiveImage class={`article-image${videoId ? ' video-fallback' : ''}`} image={story.image as keyof typeof imageAssets}
          alt={story.title.replace(/\n/g, ' ')} sizes="(max-width: 600px) calc(100vw - 40px), (max-width: 760px) calc(100vw - 64px), 696px" priority="high" />
        {#if videoId}<BackgroundVideo id={videoId} title={`Background video for ${story.title.replace('\n', ' ')}`} />{/if}
      </div>
      <figcaption><span>{section} · {pub.name}</span><span>Photo: Alexander London</span></figcaption>
    </figure>
    </EditionCard>
    <div class="article-copy">
      <p class="article-lede">{story.body}</p>
      {#each parts as paragraph, i (i)}
        <p class="body-copy">{paragraph}</p>
        {#if i === 0}<aside class="article-pullquote" aria-label="The takeaway"><p>{story.takeaway}</p></aside>{/if}
        {#if i === 1 && parts.length > 2}<div class="ad-block article-ad"><span>Advertisement</span></div>{/if}
      {/each}
    </div>
    {#if !expanded}<ScrollUnlock storyId={story.id} accent={pub.brand} />{/if}
    {#if finalArticle}
      <FinalArticleMoment storyId={story.id} {collected} />
    {:else if index === halfway.target - 1}
      <HalfwayMoment progress={halfway} />
    {:else}
    <div class="article-collection-receipt" class:receipt-collected={collected}>
      <span class="receipt-mark" aria-hidden="true">{#if collected}<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8"><path d="m4.5 10 3.5 3.5 7.5-7.5" /></svg>{:else}{String(index + 1).padStart(2, '0')}{/if}</span>
      <div class="receipt-copy" aria-live="polite" aria-atomic="true"><strong>{collected ? 'One more perspective, collected.' : 'A story worth keeping.'}</strong><span>{collected ? `Card ${String(index + 1).padStart(2, '0')} is in your daily set.` : 'Finish the full story to add this card to your set.'}</span></div>
      <button onclick={() => openSheet('collection')}>View your set</button>
    </div>
    {/if}
  </article>
{/if}
