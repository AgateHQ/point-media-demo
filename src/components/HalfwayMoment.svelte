<script lang="ts">
  import { untrack } from 'svelte';
  import { demo, halfwayProgress, move, openSheet } from '../demo.svelte';
  import { storySections } from '../data';
  import Icon from './Icon.svelte';

  let { progress }: { progress: ReturnType<typeof halfwayProgress> } = $props();
  let moment: HTMLElement;
  const reachedOnArrival = untrack(() => progress.reached);
  let celebrate = $derived(progress.reached && !reachedOnArrival);
  let currentCollected = $derived(progress.collected.includes(progress.firstHalf[progress.target - 1].id));
  let description = $derived(progress.reached
    ? 'Four perspectives, collected. Take a breath. The second half is ready when you are.'
    : currentCollected ? 'This card is in your set. Collect the earlier stories to complete your first half.'
    : 'Finish this full story to collect its card. Your halfway milestone is waiting.');

  $effect(() => {
    if (!celebrate) return;
    const frame = requestAnimationFrame(() => {
      if (demo.sheet) return;
      const header = document.querySelector('.site-header')?.getBoundingClientRect();
      const journey = document.querySelector('.edition-journey')?.getBoundingClientRect();
      const clearTop = (header?.height || 0) + (journey?.height || 0) + 16;
      const bounds = moment.getBoundingClientRect();
      // At the end of a short phone viewport, the sticky journey can cover
      // the top of the checkpoint. Reveal the seal, not just the buttons.
      if (bounds.top < clearTop && bounds.bottom > clearTop) window.scrollBy({
        top: bounds.top - clearTop,
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
      });
    });
    return () => cancelAnimationFrame(frame);
  });
</script>

<section bind:this={moment} class="halfway-moment" class:halfway-earned={progress.reached} class:halfway-celebrate={celebrate}
  aria-labelledby="halfway-title" style={`--halfway-progress:${progress.count / progress.total * 100}`}>
  <div class="halfway-kicker"><span>The halfway mark</span><span>Chapter 01 / 02</span></div>

  <div class="halfway-hero">
    <div class="halfway-seal" role="progressbar" aria-label="First-half stories collected in your daily edition"
      aria-valuemin="0" aria-valuemax={progress.total} aria-valuenow={progress.count}
      aria-valuetext={`${progress.count} of the first ${progress.target} stories collected. ${progress.total} stories in the edition.`}>
      <svg viewBox="0 0 112 112" fill="none" aria-hidden="true">
        <circle class="halfway-ring-track" cx="56" cy="56" r="46" />
        <circle class="halfway-ring-fill" cx="56" cy="56" r="46" pathLength="100" />
        <path class="halfway-star" d="m56 0 1.7 4.3L62 6l-4.3 1.7L56 12l-1.7-4.3L50 6l4.3-1.7Z" />
      </svg>
      <div class="halfway-seal-count" aria-hidden="true"><strong>{String(progress.count).padStart(2, '0')}</strong><span>of {String(progress.total).padStart(2, '0')}</span></div>
    </div>
    <div class="halfway-copy">
      <h2 id="halfway-title">{#if progress.reached}You’re halfway<br />through.{:else}Halfway,<br />within reach.{/if}</h2>
      <p>{description}</p>
    </div>
  </div>

  <div class="halfway-first-half">
    <span>{progress.reached ? 'First half, collected' : 'Your first four stories'}</span>
    <div class="halfway-stamps">
      {#each progress.firstHalf as story, i (story.id)}
        <span class="halfway-stamp" class:stamp-earned={progress.collected.includes(story.id)}
          aria-label={`Story ${i + 1}: ${progress.collected.includes(story.id) ? 'collected' : 'not yet collected'}`}>
          <span aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
          {#if progress.collected.includes(story.id)}<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="m3.5 8 3 3 6-6" /></svg>{/if}
        </span>
      {/each}
    </div>
  </div>

  <div class="halfway-next">
    <span class="halfway-next-label">In the second half</span>
    <ol>
      {#each progress.secondHalf as story, i (story.id)}
        <li><span>{String(progress.target + i + 1).padStart(2, '0')}</span><strong>{storySections[story.id] || 'News'}</strong></li>
      {/each}
    </ol>
  </div>

  <div class="halfway-actions">
    {#if progress.reached}
      <button class="halfway-continue" onclick={() => move(1)}>Continue the journey <Icon /></button>
    {:else}
      <span class="halfway-pending">{progress.count} of {progress.target} first-half cards collected</span>
    {/if}
    <button class="halfway-set" onclick={() => openSheet('collection')}>View your set <span aria-hidden="true">↗</span></button>
  </div>
  <p class="halfway-preview-note"><svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><path d="m10 3 1.8 5.2L17 10l-5.2 1.8L10 17l-1.8-5.2L3 10l5.2-1.8Z" /></svg><span>Your secret preview is waiting at the finish.</span></p>
  <span class="halfway-announcement" role="status" aria-atomic="true">{celebrate ? 'Halfway milestone reached. Your first four full stories are collected. Continue whenever you’re ready.' : ''}</span>
</section>

<style>
  .halfway-moment {
    container: halfway-moment / inline-size;
    position: relative;
    margin-top: 32px;
    padding: 28px;
    border: 1px solid color-mix(in srgb, var(--publication-brand) 24%, transparent);
    border-top: 3px solid var(--publication-brand);
    border-radius: 3px;
    color: var(--edition-ink);
    background: color-mix(in srgb, var(--publication-brand) 4%, var(--edition-bg));
    box-shadow: 5px 5px 0 color-mix(in srgb, var(--publication-brand) 7%, transparent);
  }
  .halfway-kicker { display: flex; justify-content: space-between; flex-wrap: wrap; gap: 10px 20px; color: var(--publication-brand); font-family: 'DM Sans', sans-serif; font-size: .6875rem; font-weight: 800; line-height: 1.4; letter-spacing: .1em; text-transform: uppercase; }
  .halfway-kicker>span:last-child { color: color-mix(in srgb, var(--edition-ink) 58%, var(--edition-bg)); font-weight: 500; font-variant-numeric: tabular-nums; }
  .halfway-hero { display: grid; grid-template-columns: 112px minmax(0, 1fr); grid-template-areas: 'seal title' 'seal copy'; align-items: center; gap: 14px 28px; margin: 28px 0 24px; }
  .halfway-seal { grid-area: seal; position: relative; width: 112px; height: 112px; flex-shrink: 0; }
  .halfway-seal>svg { display: block; width: 100%; height: 100%; overflow: visible; }
  .halfway-ring-track { stroke: color-mix(in srgb, var(--publication-brand) 15%, transparent); stroke-width: 2; }
  .halfway-ring-fill { stroke: var(--publication-brand); stroke-width: 4; stroke-linecap: round; stroke-dasharray: 100; stroke-dashoffset: calc(100 - var(--halfway-progress)); transform: rotate(-90deg); transform-origin: 56px 56px; transition: stroke-dashoffset var(--motion-duration-composed) var(--motion-ease-enter); }
  .halfway-star { fill: var(--publication-brand); opacity: .55; transition: opacity var(--motion-duration-standard) var(--motion-ease-standard); }
  .halfway-earned .halfway-star { opacity: 1; }
  .halfway-seal-count { position: absolute; inset: 0; display: flex; flex-direction: column; justify-content: center; align-items: center; gap: 4px; font-family: 'Manrope', sans-serif; }
  .halfway-seal-count strong { color: var(--publication-brand); font-size: 2.625rem; font-weight: 800; line-height: 1; letter-spacing: -.07em; font-variant-numeric: tabular-nums; }
  .halfway-seal-count>span { color: color-mix(in srgb, var(--edition-ink) 62%, var(--edition-bg)); font-size: .6875rem; letter-spacing: .08em; text-transform: uppercase; }
  .halfway-copy { display: contents; }
  .halfway-copy h2 { grid-area: title; min-width: 0; margin: 0; color: var(--edition-ink); font-family: var(--article-title-font, 'Manrope', sans-serif); font-size: 2.75rem; font-weight: 800; line-height: 1.04; letter-spacing: -.035em; text-wrap: balance; }
  .halfway-copy p { grid-area: copy; min-width: 0; margin: 0; color: color-mix(in srgb, var(--edition-ink) 74%, var(--edition-bg)); font-family: 'DM Sans', sans-serif; font-size: .875rem; line-height: 1.65; }
  .halfway-first-half { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 14px; padding: 0 0 22px; border-bottom: 1px solid color-mix(in srgb, var(--publication-brand) 20%, transparent); }
  .halfway-first-half>span, .halfway-next-label { color: var(--publication-brand); font-family: 'DM Sans', sans-serif; font-size: .6875rem; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; }
  .halfway-stamps { display: flex; gap: 7px; }
  .halfway-stamp { display: flex; align-items: center; justify-content: center; gap: 4px; min-width: 42px; height: 30px; padding: 0 7px; border: 1px solid color-mix(in srgb, var(--publication-brand) 23%, transparent); border-top-width: 3px; border-radius: 2px; color: color-mix(in srgb, var(--edition-ink) 54%, var(--edition-bg)); font-family: 'Manrope', sans-serif; font-size: .625rem; font-weight: 800; font-variant-numeric: tabular-nums; transition: color var(--motion-duration-quick) var(--motion-ease-standard), background var(--motion-duration-quick) var(--motion-ease-standard); }
  .halfway-stamp svg { width: 13px; height: 13px; }
  .stamp-earned { color: #fff; background: var(--publication-brand); border-color: var(--publication-brand); }
  .halfway-next { padding-top: 21px; }
  .halfway-next ol { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; margin: 13px 0 0; padding: 0; list-style: none; }
  .halfway-next li { display: flex; flex-direction: column; gap: 5px; min-width: 0; padding-left: 11px; border-left: 1px solid color-mix(in srgb, var(--publication-brand) 25%, transparent); }
  .halfway-next li>span { color: color-mix(in srgb, var(--edition-ink) 52%, var(--edition-bg)); font-size: .625rem; font-variant-numeric: tabular-nums; }
  .halfway-next li>strong { color: var(--edition-ink); font-family: 'DM Sans', sans-serif; font-size: .8125rem; font-weight: 600; line-height: 1.4; overflow-wrap: anywhere; }
  .halfway-actions { display: flex; align-items: center; flex-wrap: wrap; gap: 12px 20px; margin-top: 25px; min-height: 48px; }
  .halfway-continue { display: flex; align-items: center; justify-content: space-between; gap: 20px; min-height: 48px; padding: 13px 16px; flex: 1 1 14rem; border-radius: 3px; background: var(--publication-brand); color: #fff; font-size: .8125rem; font-weight: 700; line-height: 1.4; text-align: left; }
  .halfway-continue :global(svg) { width: 17px; height: 17px; }
  .halfway-pending { display: flex; align-items: center; flex: 1 1 14rem; min-height: 48px; color: color-mix(in srgb, var(--edition-ink) 67%, var(--edition-bg)); font-size: .8125rem; line-height: 1.4; }
  .halfway-set { display: flex; align-items: center; gap: 7px; min-height: 44px; padding: 10px 0; color: var(--publication-brand); background: transparent; font-size: .8125rem; font-weight: 700; text-decoration: underline; text-underline-offset: 4px; text-decoration-color: color-mix(in srgb, var(--publication-brand) 40%, transparent); }
  .halfway-set>span { font-size: 1rem; }
  .halfway-actions button:focus-visible { outline-color: var(--publication-brand); }
  .halfway-preview-note { display: flex; align-items: center; gap: 8px; margin: 18px 0 0; color: color-mix(in srgb, var(--edition-ink) 60%, var(--edition-bg)); font-family: 'DM Sans', sans-serif; font-size: .75rem; line-height: 1.5; }
  .halfway-preview-note svg { flex-shrink: 0; width: 17px; height: 17px; color: var(--publication-brand); }
  .halfway-announcement { position: absolute; width: 1px; height: 1px; margin: -1px; padding: 0; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
  .halfway-celebrate .halfway-copy h2 { animation: halfway-settle var(--motion-duration-composed) var(--motion-ease-enter) both; }
  .halfway-celebrate .halfway-seal-count strong { animation: halfway-settle var(--motion-duration-composed) var(--motion-ease-enter) both; }
  @keyframes halfway-settle { from { opacity: .25; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
  @container halfway-moment (max-width: 30rem) {
    .halfway-hero { grid-template-columns: minmax(0, 1fr) 80px; grid-template-areas: 'title seal' 'copy copy'; gap: 16px; margin: 22px 0 20px; }
    .halfway-seal { width: 80px; height: 80px; }
    .halfway-seal-count strong { font-size: 2rem; }
    .halfway-copy h2 { font-size: 2rem; }
    .halfway-first-half { gap: 10px; padding-bottom: 18px; }
    .halfway-next { padding-top: 18px; }
    .halfway-next ol { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px 12px; }
    .halfway-actions { margin-top: 20px; }
    .halfway-preview-note { margin-top: 14px; }
  }
  @container halfway-moment (max-width: 12rem) {
    .halfway-hero { grid-template-columns: 1fr; grid-template-areas: 'seal' 'title' 'copy'; }
    .halfway-seal { width: max(112px, 4rem); height: max(112px, 4rem); }
    .halfway-stamps { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); width: 100%; }
  }
  @media (max-width: 600px) { .halfway-moment { padding: 20px; } }
  @media (prefers-reduced-motion: reduce) {
    .halfway-ring-fill, .halfway-star, .halfway-stamp { transition: none; }
    .halfway-celebrate .halfway-copy h2, .halfway-celebrate .halfway-seal-count strong { animation: none; }
  }
</style>
