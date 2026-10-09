<script lang="ts">
  import { untrack } from 'svelte';
  import { getStories, move, openSheet, pubCollected, pubVisited } from '../demo.svelte';
  import Icon from './Icon.svelte';

  let { storyId, collected }: { storyId: string; collected: boolean } = $props();

  const collectedOnArrival = untrack(() => pubCollected().includes(storyId));
  let stories = $derived(getStories());
  let total = $derived(stories.length);
  let collectedIds = $derived(pubCollected());
  let openedIds = $derived(pubVisited());
  let collectedCount = $derived(stories.filter(story => collectedIds.includes(story.id)).length);
  let openedCount = $derived(stories.filter(story => openedIds.includes(story.id)).length);
  let ready = $derived(collected && openedCount === total);
  let perfectSet = $derived(collectedCount === total);
  let celebrate = $derived(collected && !collectedOnArrival);
  let title = $derived(collected ? 'The last page.' : 'The finish is here.');
  let description = $derived(collected
    ? perfectSet
      ? 'Eight stories, collected. Today’s edition is complete — and something new is waiting beyond it.'
      : ready
        ? `Today’s edition is read. ${total - collectedCount} ${total - collectedCount === 1 ? 'card remains' : 'cards remain'} if you want the complete set.`
        : 'This story is collected. We’ll take you back to anything you passed before opening the preview.'
    : 'Finish this full story to collect the eighth card and close today’s edition on your own terms.');
</script>

<section class="final-moment" class:final-earned={collected} class:final-celebrate={celebrate}
  aria-labelledby="final-title" data-final-article-moment>
  <div class="final-rule" aria-hidden="true"><span></span><strong>Finish</strong><span></span></div>

  <div class="final-heading">
    <div class="final-number" aria-hidden="true">
      <strong>{String(total).padStart(2, '0')}</strong><span>/ {String(total).padStart(2, '0')}</span>
    </div>
    <div class="final-copy">
      <span class="final-kicker">The final chapter</span>
      <h2 id="final-title">{title}</h2>
      <p>{description}</p>
    </div>
  </div>

  <ol class="final-cards" aria-label={`${collectedCount} of ${total} story cards collected`}>
    {#each stories as story, i (story.id)}
      <li class:card-earned={collectedIds.includes(story.id)} class:card-last={i === total - 1}
        aria-label={`Story ${i + 1}: ${collectedIds.includes(story.id) ? 'collected' : 'not collected'}`}>
        <span aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
        {#if collectedIds.includes(story.id)}
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="m3.5 8 3 3 6-6" /></svg>
        {/if}
      </li>
    {/each}
  </ol>

  {#if collected}
    <div class="final-actions">
      <button class="final-complete" onclick={() => move(1)}>
        <span>{ready ? 'Open your secret preview' : 'Complete the journey'}</span><Icon />
      </button>
      <button class="final-set" onclick={() => openSheet('collection')}>Your daily set · {collectedCount} / {total}</button>
    </div>
  {:else}
    <div class="final-pending"><span></span><strong>One full story to the line</strong><span></span></div>
  {/if}

  <span class="final-announcement" role="status" aria-atomic="true">
    {celebrate ? `Final story collected. ${ready ? 'Today’s edition is complete and your secret preview is unlocked.' : 'Complete any stories you passed to unlock your preview.'}` : ''}
  </span>
</section>

<style>
  .final-moment {
    container: final-moment / inline-size;
    position: relative;
    margin-top: 40px;
    padding: 30px;
    overflow: hidden;
    border: 1px solid color-mix(in srgb, var(--publication-brand) 28%, transparent);
    border-top: 4px solid var(--publication-brand);
    border-radius: 3px;
    color: var(--edition-ink);
    background:
      linear-gradient(135deg, color-mix(in srgb, var(--publication-brand) 7%, transparent), transparent 52%),
      color-mix(in srgb, var(--edition-bg) 94%, #fff);
    box-shadow: 6px 6px 0 color-mix(in srgb, var(--publication-brand) 8%, transparent);
  }
  .final-moment::after {
    content: '';
    position: absolute;
    right: -34px;
    top: -34px;
    width: 104px;
    height: 104px;
    border: 1px solid color-mix(in srgb, var(--publication-brand) 14%, transparent);
    border-radius: 50%;
    box-shadow: 0 0 0 18px color-mix(in srgb, var(--publication-brand) 3%, transparent);
    pointer-events: none;
  }
  .final-rule { display: grid; grid-template-columns: 1fr auto 1fr; align-items: center; gap: 12px; color: var(--publication-brand); }
  .final-rule span { height: 1px; background: currentColor; opacity: .38; }
  .final-rule strong { font-size: .6875rem; line-height: 1; letter-spacing: .16em; text-transform: uppercase; }
  .final-heading { display: grid; grid-template-columns: 116px minmax(0, 1fr); align-items: center; gap: 28px; margin: 30px 0 28px; }
  .final-number { display: flex; flex-direction: column; justify-content: center; align-items: center; width: 116px; aspect-ratio: 1; border: 1px solid color-mix(in srgb, var(--publication-brand) 30%, transparent); border-radius: 50%; font-family: 'Manrope', sans-serif; background: var(--edition-bg); box-shadow: inset 0 0 0 7px color-mix(in srgb, var(--publication-brand) 5%, transparent); }
  .final-number strong { color: var(--publication-brand); font-size: 2.75rem; line-height: .9; letter-spacing: -.075em; font-variant-numeric: tabular-nums; }
  .final-number span { margin-top: 7px; color: color-mix(in srgb, var(--edition-ink) 58%, var(--edition-bg)); font-size: .6875rem; letter-spacing: .1em; }
  .final-kicker { display: block; margin-bottom: 9px; color: var(--publication-brand); font-size: .6875rem; font-weight: 800; letter-spacing: .12em; text-transform: uppercase; }
  .final-copy h2 { margin: 0; color: var(--edition-ink); font-family: var(--article-title-font, 'Manrope', sans-serif); font-size: clamp(2.15rem, 6cqi, 3.25rem); font-weight: 800; line-height: 1.02; letter-spacing: -.04em; text-wrap: balance; }
  .final-copy p { margin: 13px 0 0; color: color-mix(in srgb, var(--edition-ink) 73%, var(--edition-bg)); font-family: 'DM Sans', sans-serif; font-size: .875rem; line-height: 1.65; }
  .final-cards { display: grid; grid-template-columns: repeat(8, minmax(0, 1fr)); gap: 7px; margin: 0; padding: 20px 0; border-top: 1px solid color-mix(in srgb, var(--publication-brand) 18%, transparent); border-bottom: 1px solid color-mix(in srgb, var(--publication-brand) 18%, transparent); list-style: none; }
  .final-cards li { position: relative; display: grid; place-items: center; min-width: 0; height: 38px; border: 1px solid color-mix(in srgb, var(--publication-brand) 24%, transparent); border-top: 3px solid color-mix(in srgb, var(--publication-brand) 45%, transparent); border-radius: 2px; color: color-mix(in srgb, var(--edition-ink) 52%, var(--edition-bg)); font-family: 'Manrope', sans-serif; font-size: .625rem; font-weight: 800; font-variant-numeric: tabular-nums; transition: color .3s, background .3s, border-color .3s; }
  .final-cards svg { position: absolute; width: 15px; height: 15px; opacity: 0; transform: scale(.75); }
  .final-cards .card-earned { color: #fff; background: var(--publication-brand); border-color: var(--publication-brand); }
  .final-cards .card-earned>span { opacity: 0; }
  .final-cards .card-earned svg { opacity: 1; transform: scale(1); transition: opacity .3s, transform .4s cubic-bezier(.22, 1, .36, 1); }
  .final-cards .card-last { box-shadow: 0 0 0 3px color-mix(in srgb, var(--publication-brand) 9%, transparent); }
  .final-actions { display: grid; grid-template-columns: minmax(0, 1fr) auto; align-items: center; gap: 16px; margin-top: 24px; }
  .final-complete { display: flex; align-items: center; justify-content: space-between; gap: 18px; min-height: 52px; padding: 14px 17px; border-radius: 3px; color: #fff; background: var(--publication-brand); font-size: .875rem; font-weight: 700; text-align: left; }
  .final-complete :global(svg) { width: 18px; height: 18px; }
  .final-set { padding: 12px 0; color: var(--publication-brand); background: transparent; font-size: .75rem; font-weight: 700; text-decoration: underline; text-decoration-color: color-mix(in srgb, var(--publication-brand) 38%, transparent); text-underline-offset: 4px; }
  .final-actions button:focus-visible { outline-color: var(--publication-brand); }
  .final-pending { display: grid; grid-template-columns: 1fr auto 1fr; align-items: center; gap: 12px; margin-top: 22px; color: color-mix(in srgb, var(--edition-ink) 58%, var(--edition-bg)); }
  .final-pending span { height: 1px; background: color-mix(in srgb, var(--publication-brand) 20%, transparent); }
  .final-pending strong { font-size: .6875rem; font-weight: 600; letter-spacing: .08em; text-transform: uppercase; }
  .final-announcement { position: absolute; width: 1px; height: 1px; margin: -1px; padding: 0; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
  .final-celebrate .final-number { animation: final-settle .7s cubic-bezier(.22, 1, .36, 1) both; }
  .final-celebrate .final-copy h2 { animation: final-settle .7s .06s cubic-bezier(.22, 1, .36, 1) both; }
  .final-celebrate .final-complete { animation: final-action .55s .16s cubic-bezier(.22, 1, .36, 1) both; }
  @keyframes final-settle { from { opacity: .2; transform: translateY(7px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes final-action { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }

  @container final-moment (max-width: 31rem) {
    .final-heading { grid-template-columns: 86px minmax(0, 1fr); gap: 18px; margin: 24px 0 22px; }
    .final-number { width: 86px; }
    .final-number strong { font-size: 2rem; }
    .final-copy h2 { font-size: 2.2rem; }
    .final-cards { gap: 4px; }
    .final-cards li { height: 33px; font-size: .5625rem; }
    .final-actions { grid-template-columns: 1fr; gap: 5px; }
    .final-set { justify-self: start; }
  }
  @container final-moment (max-width: 18rem) {
    .final-heading { grid-template-columns: 1fr; }
    .final-number { width: 96px; }
    .final-cards { grid-template-columns: repeat(4, minmax(0, 1fr)); }
  }
  @media (max-width: 600px) { .final-moment { margin-top: 32px; padding: 22px 20px; } }
  @media (prefers-reduced-motion: reduce) {
    .final-cards li, .final-cards svg { transition: none; }
    .final-celebrate .final-number, .final-celebrate .final-copy h2, .final-celebrate .final-complete { animation: none; }
  }
</style>
