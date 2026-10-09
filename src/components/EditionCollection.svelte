<script lang="ts">
  import { currentPub, getStories, openStory, pubCollected } from '../demo.svelte';
  import EditionCard from './EditionCard.svelte';

  let pub = $derived(currentPub());
  let stories = $derived(getStories());
  let collected = $derived(pubCollected());
  let count = $derived(stories.filter(story => collected.includes(story.id)).length);
  let headlineFont = $derived(pub.id === 'the-scoop' ? "'Anton', Impact, sans-serif" : pub.id === 'full-time' ? "'Barlow Condensed', sans-serif"
    : ['evening-lantern', 'northgate-ledger'].includes(pub.id) ? "Georgia, 'Times New Roman', serif" : "'Manrope', sans-serif");
</script>

<section class="edition-collection" style:--article-title-font={headlineFont}>
  <header class="collection-heading">
    <div><span class="collection-eyebrow">{pub.name} · The daily set</span><h2>Your stories.<br />Your collection.</h2></div>
    <div class="collection-tally" aria-label={`${count} of ${stories.length} cards collected`}><strong>{count}</strong><span>of {stories.length}<br />collected</span></div>
  </header>
  <p class="collection-instruction">Finish a full story to collect its card. Tap any card to read it.</p>
  <div class="collection-progress" role="progressbar" aria-label="Story cards collected" aria-valuemin="0" aria-valuemax={stories.length} aria-valuenow={count}>
    {#each stories as story (story.id)}<span class:collected={collected.includes(story.id)} aria-hidden="true"></span>{/each}
  </div>
  <div class="collection-grid">
    {#each stories as story, i (story.id)}
      <button class="collection-card-button" onclick={() => openStory(story.id)} aria-label={`${collected.includes(story.id) ? 'Revisit collected' : 'Read'} card ${i + 1}: ${story.title.replace(/\n/g, ' ')}`}>
        <EditionCard {story} number={i + 1} total={stories.length} collected={collected.includes(story.id)} compact />
      </button>
    {/each}
  </div>
  <p class="collection-footnote">Your collection is saved on this device.</p>
</section>

<style>
  :global(dialog.collection-sheet) { inset: 32px 0 auto; width: min(800px, calc(100% - 40px)); max-width: none; max-height: calc(100svh - 64px); margin: 0 auto; padding: 36px 30px 24px; overflow-y: auto; overscroll-behavior: contain; color: var(--edition-ink); background: var(--edition-bg); border: 1px solid color-mix(in srgb, var(--publication-brand) 20%, transparent); border-radius: 10px; }
  :global(.collection-sheet .sheet-handle) { display: none; }
  :global(.collection-sheet .close) { color: var(--edition-ink); top: 12px; right: 14px; }
  .collection-heading { display: flex; align-items: flex-end; justify-content: space-between; gap: 22px; }
  .collection-heading>div:first-child { min-width: 0; }
  .collection-eyebrow { color: var(--publication-brand); font-size: .6875rem; letter-spacing: .08em; text-transform: uppercase; font-weight: 700; }
  .collection-heading h2 { margin: 14px 0 0; color: var(--edition-ink); font-family: 'Manrope', sans-serif; font-size: clamp(1.75rem, 4vw, 2.5rem); font-weight: 800; line-height: 1.05; letter-spacing: -.055em; }
  .collection-tally { display: flex; align-items: center; gap: 10px; flex-shrink: 0; }
  .collection-tally strong { font-family: 'Manrope', sans-serif; font-size: 3rem; line-height: .95; letter-spacing: -.08em; }
  .collection-tally span { font-size: .75rem; line-height: 1.4; color: color-mix(in srgb, var(--edition-ink) 65%, var(--edition-bg)); }
  .collection-instruction { margin: 20px 0 15px; color: color-mix(in srgb, var(--edition-ink) 75%, var(--edition-bg)); font-size: .875rem; line-height: 1.5; }
  .collection-progress { display: grid; grid-template-columns: repeat(8, minmax(0, 1fr)); gap: 5px; margin-bottom: 26px; }
  .collection-progress span { height: 4px; border-radius: 2px; background: color-mix(in srgb, var(--publication-brand) 15%, transparent); }
  .collection-progress .collected { background: var(--publication-brand); }
  .collection-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 18px 14px; }
  .collection-card-button { padding: 0; text-align: left; min-width: 0; background: transparent; border-radius: 3px; transition: transform var(--motion-duration-quick) var(--motion-ease-standard); }
  .collection-card-button:hover { transform: translateY(-3px); filter: none; }
  .collection-card-button:focus-visible { outline-color: var(--publication-brand); outline-offset: 4px; }
  .collection-footnote { margin: 28px 0 0; font-size: .75rem; text-align: center; color: color-mix(in srgb, var(--edition-ink) 60%, var(--edition-bg)); }

  @media (max-width: 700px) { .collection-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 20px 14px; } }
  @media (max-width: 600px) {
    :global(dialog.collection-sheet) { inset: auto 0 0; width: 100%; max-width: 100%; max-height: 92svh; padding: 36px 20px max(24px, calc(env(safe-area-inset-bottom) + 20px)); border-radius: 18px 18px 0 0; }
    .collection-heading { gap: 16px; flex-wrap: wrap; }
    .collection-heading h2 { font-size: 1.875rem; }
    .collection-tally strong { font-size: 2.5rem; }
    .collection-eyebrow { display: block; max-width: 230px; padding-right: 16px; line-height: 1.5; }
  }
  @media (max-width: 360px) { .collection-grid { gap: 16px 10px; } }
  @media (prefers-reduced-motion: reduce) { .collection-card-button { transition: none; } }
</style>
