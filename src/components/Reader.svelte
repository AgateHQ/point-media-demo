<script lang="ts">
  import { onMount } from 'svelte';
  import { demo, currentPub, getStories, storyIndex, pubVisited, pubExpanded, home, claim, move } from '../demo.svelte';
  import { articlePreview, storyVideos, storySections } from '../data';
  import imageAssets from '../image-assets.json';
  import { readerIsAtBottom } from '../gestures';
  import Icon from './Icon.svelte';
  import BackgroundVideo from './BackgroundVideo.svelte';
  import ScrollUnlock from './ScrollUnlock.svelte';
  import ResponsiveImage from './ResponsiveImage.svelte';

  let pub = $derived(currentPub());
  let index = $derived(storyIndex());
  let story = $derived(getStories()[index]);
  let ad = $derived(demo.data.position === 4);
  let expanded = $derived(pubExpanded().includes(story.id));
  let visited = $derived(pubVisited());
  let videoId = $derived(!ad ? storyVideos[`${pub.id}:${story.id}`] : '');
  let parts = $derived((expanded ? story.expandedBody : articlePreview(story)).split('\n\n'));
  let section = $derived(storySections[story.id] || 'News');

  onMount(() => {
    if (!ad || demo.data.reward) return;
    const timer = window.setTimeout(claim, 700);
    return () => window.clearTimeout(timer);
  });

  $effect(() => {
    if (ad ? !demo.data.reward : !expanded) return;
    let frame = 0;
    let timer = 0;
    const clearTimer = () => { if (timer) window.clearTimeout(timer); timer = 0; };
    const update = () => {
      frame = 0;
      if (demo.sheet || !readerIsAtBottom()) { clearTimer(); return; }
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
      <div class="progress" aria-label={`${visited.length} of 8 stories visited`}>
        {#each getStories() as st (st.id)}<span class:seen={visited.includes(st.id)}></span>{/each}
      </div>
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
      <div class="article-edition-progress">
        <span>{String(index + 1).padStart(2, '0')} / 08</span>
        <div class="progress" aria-label={`${visited.length} of 8 stories visited`}>
          {#each getStories() as st, i (st.id)}<span class:seen={visited.includes(st.id)} class:active={i === index}></span>{/each}
        </div>
      </div>
    </div>
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
    <div class="article-copy">
      <p class="article-lede">{story.body}</p>
      {#each parts as paragraph, i (i)}
        <p class="body-copy">{paragraph}</p>
        {#if i === 0}<aside class="article-pullquote" aria-label="The takeaway"><p>{story.takeaway}</p></aside>{/if}
        {#if i === 1 && parts.length > 2}<div class="ad-block article-ad"><span>Advertisement</span></div>{/if}
      {/each}
    </div>
    {#if !expanded}<ScrollUnlock storyId={story.id} accent={pub.brand} />{/if}
    <div class="article-endnote"><span class="article-end-mark" aria-hidden="true"></span><span>{pub.name} · Your daily edition</span></div>
  </article>
{/if}
