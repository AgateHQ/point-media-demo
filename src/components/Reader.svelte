<script lang="ts">
  import { onMount } from 'svelte';
  import { demo, currentPub, getStories, storyIndex, pubVisited, pubExpanded, home, claim, move } from '../demo.svelte';
  import { articlePreview, storyVideos, adGradients } from '../data';
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
  let gradient = $derived(adGradients[index % adGradients.length]);

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

<section class="story-visual" class:sponsored-visual={ad}>
  <ResponsiveImage class={`story-image${videoId ? ' video-fallback' : ''}`} image={(ad ? '20260603-R0000419' : story.image) as keyof typeof imageAssets}
    alt={ad ? 'Sponsored content' : story.title} priority="high" />
  {#if videoId}<BackgroundVideo id={videoId} title={`Background video for ${story.title.replace('\n', ' ')}`} />{/if}
  <div class="image-shade"></div>
  <div class="reader-top">
    <div class="progress" aria-label={`${visited.length} of 8 stories visited`}>
      {#each getStories() as st, i (st.id)}
        <span class:seen={visited.includes(st.id)} class:active={!ad && i === index} style:background={!ad && i === index ? pub.accent : undefined}></span>
      {/each}
    </div>
    <div class="reader-meta">
      <button onclick={home} aria-label="Back to front page" class="back-arrow"><Icon /></button>
      <span>{ad ? 'PARTNER MOMENT' : `${String(index + 1).padStart(2, '0')} / 08`}</span>
    </div>
  </div>
  <div class="story-visual-copy">
    {#if ad}
      <span class="pill">SPONSORED</span><h1>Good nights.<br /><em>Good rewards.</em></h1>
    {:else}
      <div class="eyebrow" style:color={pub.accent}>{story.tag}<span>{pub.name.toUpperCase()}</span></div>
      <h1>{#each story.title.split('\n') as line, i}{#if i > 0}<br />{/if}{line}{/each}</h1>
    {/if}
    <span class="story-scroll-cue" aria-hidden="true"><Icon /></span>
  </div>
</section>
{#if ad}
  <article class="story-content sponsored">
    <p>Your next great night starts with a little something back. Enjoy 10p on us, straight to your wallet.</p>
    <div class="reward-status" aria-live="polite" style={`--reward-accent:${pub.accent}`}>{demo.data.reward ? '✓ 10p added to your wallet' : 'Adding 10p to your wallet…'}</div>
    <small>A fictional partner. A simulated reward. No purchase needed.</small>
  </article>
{:else}
  <article class="story-content" class:expanded data-story-id={story.id}>
    <p class="standfirst">{story.subtitle}</p>
    {#each parts as paragraph, i (i)}
      <p class="body-copy">{paragraph}</p>
      {#if i === 1 && parts.length > 2}<div class="ad-block" style={`background:linear-gradient(135deg,${gradient})`}><span>Advertisement</span></div>{/if}
    {/each}
    {#if !expanded}<ScrollUnlock storyId={story.id} accent={pub.accent} />{/if}
    <div class="takeaway" style:border-color={`${pub.accent}30`}><span style:color={pub.accent}>THE POINT?</span><p>{story.takeaway}</p></div>
  </article>
{/if}
