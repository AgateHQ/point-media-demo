<script lang="ts">
  import { demo, getStories, pubVisited, pubCollected, halfwayProgress, storyIndex } from '../demo.svelte';

  let stories = $derived(getStories());
  let visited = $derived(pubVisited());
  let collected = $derived(pubCollected());
  let complete = $derived(demo.data.screen === 'complete');
  let partner = $derived(!complete && demo.data.position === 4);
  let current = $derived(complete ? stories.length + 1 : partner ? 4 : storyIndex() + 1);
  let opened = $derived(stories.filter(story => visited.includes(story.id)).length);
  let halfway = $derived(halfwayProgress());
  let atMidpoint = $derived(!complete && !partner && current === halfway.target);
  let atFinish = $derived(!complete && !partner && current === stories.length);
  let caption = $derived(complete ? 'Your secret preview is unlocked' : partner ? 'A reward between stories'
    : atFinish ? 'The final story' : atMidpoint ? halfway.reached ? 'Halfway milestone reached' : 'The halfway chapter' : 'Your daily edition');
  let announcement = $derived(complete ? `Edition complete. ${stories.length} of ${stories.length} articles. Bonus preview unlocked.`
    : partner ? `Partner moment. ${opened} of ${stories.length} articles opened.` : `Article ${current} of ${stories.length}.`);
</script>

<section class="edition-journey" class:journey-complete={complete} class:journey-partner={partner} class:journey-finish={atFinish} aria-label="Edition journey">
  <div class="journey-heading">
    <div class="journey-title">
      <span class="journey-eyebrow">Today’s journey</span>
      <span class="journey-caption">{caption}</span>
    </div>
    <div class="journey-count" aria-live="polite" aria-atomic="true">
      <span class="journey-sr-only">{announcement}</span>
      <span aria-hidden="true" class="journey-number">{current}</span>
      <span aria-hidden="true" class="journey-denominator">{complete ? '/' : 'of'} <strong>{stories.length}</strong></span>
    </div>
  </div>

  <div class="journey-map">
    <div class="journey-stories" role="progressbar" aria-label="Article position in today’s edition"
      aria-valuemin="0" aria-valuemax={stories.length} aria-valuenow={Math.min(current, stories.length)} aria-valuetext={announcement}>
      {#each stories as story, i (story.id)}
        <span class="journey-step" class:journey-current={!complete && !partner && i + 1 === current}
          class:journey-seen={visited.includes(story.id)} class:journey-collected={collected.includes(story.id)} class:journey-finished={complete} aria-hidden="true">
          <span class="journey-step-number">
            {#if collected.includes(story.id)}
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8"><path d="m4 8 2.5 2.5L12 5" /></svg>
            {:else}{i + 1}{/if}
          </span>
          <span class="journey-step-track"></span>
        </span>
      {/each}
    </div>
    <div class="journey-bonus" aria-label={complete ? 'Bonus article 9 unlocked' : 'Bonus preview after article 8'}>
      <span class="journey-bonus-marker" aria-hidden="true">
        {#if complete}9{:else}<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.4"><path d="m10 3 1.8 5.2L17 10l-5.2 1.8L10 17l-1.8-5.2L3 10l5.2-1.8Z" /></svg>{/if}
      </span>
      <span class="journey-bonus-label">{complete ? 'Unlocked' : 'Just for you'}</span>
    </div>
  </div>
</section>

<style>
  .edition-journey {
    --journey-quiet: color-mix(in srgb, var(--edition-ink) 64%, var(--edition-bg));
    position: sticky;
    top: var(--article-header-height, 72px);
    z-index: 15;
    flex: 0 0 auto;
    width: 100%;
    max-width: 760px;
    container: edition-journey / inline-size;
    margin: 0 auto;
    padding: 20px 30px 18px;
    color: var(--edition-ink);
    background: var(--edition-bg);
    border-bottom: 1px solid color-mix(in srgb, var(--publication-brand) 22%, transparent);
    box-shadow: 0 8px 12px -12px color-mix(in srgb, var(--edition-ink) 30%, transparent);
  }

  .journey-heading {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 15px;
  }

  .journey-title { display: flex; flex-direction: column; gap: 5px; min-width: 0; }
  .journey-eyebrow { color: var(--publication-brand); font-size: .8125rem; font-weight: 800; letter-spacing: .1em; text-transform: uppercase; }
  .journey-caption { color: var(--journey-quiet); font-size: .8125rem; line-height: 1.4; }
  .journey-count { display: flex; align-items: baseline; gap: 7px; flex-shrink: 0; font-family: 'Manrope', sans-serif; }
  .journey-number { font-size: 2.25rem; font-weight: 800; line-height: 1; letter-spacing: -.08em; font-variant-numeric: tabular-nums; }
  .journey-denominator { color: var(--journey-quiet); font-size: .875rem; white-space: nowrap; }
  .journey-denominator strong { font-weight: 600; }

  .journey-map { display: flex; align-items: center; gap: 13px; }
  .journey-stories { display: grid; grid-template-columns: repeat(8, minmax(0, 1fr)); gap: 5px; flex: 1; min-width: 0; }
  .journey-step { display: flex; flex-direction: column; align-items: center; gap: 7px; }
  .journey-step-number {
    display: grid;
    place-items: center;
    width: 24px;
    height: 24px;
    border: 1px solid transparent;
    border-radius: 50%;
    color: var(--journey-quiet);
    font-size: .75rem;
    font-weight: 600;
    font-variant-numeric: tabular-nums;
    transition: color var(--motion-duration-quick) var(--motion-ease-standard), background var(--motion-duration-quick) var(--motion-ease-standard), border-color var(--motion-duration-quick) var(--motion-ease-standard);
  }
  .journey-step-number svg { width: 16px; height: 16px; }
  .journey-step-track { width: 100%; height: 3px; border-radius: 2px; background: color-mix(in srgb, var(--edition-ink) 14%, transparent); transition: background var(--motion-duration-standard) var(--motion-ease-standard); }
  .journey-seen .journey-step-number { color: var(--publication-brand); }
  .journey-seen .journey-step-track { background: color-mix(in srgb, var(--publication-brand) 42%, var(--edition-bg)); }
  .journey-current .journey-step-number { color: #fff; background: var(--publication-brand); border-color: var(--publication-brand); box-shadow: 0 0 0 3px color-mix(in srgb, var(--publication-brand) 10%, transparent); }
  .journey-current .journey-step-track, .journey-finished .journey-step-track, .journey-collected .journey-step-track { background: var(--publication-brand); }
  .journey-collected:not(.journey-current) .journey-step-number { background: color-mix(in srgb, var(--publication-brand) 9%, transparent); }

  .journey-bonus { display: flex; flex-direction: column; align-items: center; gap: 5px; flex: 0 0 5.125rem; min-width: 0; padding-left: 12px; border-left: 1px solid color-mix(in srgb, var(--publication-brand) 20%, transparent); }
  .journey-bonus-marker { display: grid; place-items: center; width: 25px; height: 25px; border-radius: 50%; border: 1px dashed color-mix(in srgb, var(--publication-brand) 45%, transparent); color: var(--publication-brand); font-size: .8125rem; font-weight: 800; transition: background var(--motion-duration-standard) var(--motion-ease-standard), color var(--motion-duration-standard) var(--motion-ease-standard), box-shadow var(--motion-duration-standard) var(--motion-ease-standard); }
  .journey-bonus-marker svg { width: 18px; height: 18px; }
  .journey-bonus-label { color: var(--journey-quiet); font-size: .75rem; line-height: 1.3; text-align: center; }
  .journey-complete .journey-bonus-marker { background: var(--publication-brand); color: #fff; border-style: solid; box-shadow: 0 0 0 4px color-mix(in srgb, var(--publication-brand) 12%, transparent); }
  .journey-complete .journey-bonus-label { color: var(--publication-brand); font-weight: 700; }
  .journey-finish .journey-caption { color: var(--publication-brand); font-weight: 700; }
  .journey-finish .journey-bonus-marker { border-style: solid; box-shadow: 0 0 0 4px color-mix(in srgb, var(--publication-brand) 8%, transparent); }
  .journey-sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; border: 0; }

  @media (min-width: 601px) {
    :global(.article-layout) .edition-journey { padding: 22px 32px 20px; }
    :global(.article-layout) .journey-heading { margin-bottom: 17px; }
    :global(.article-layout) .journey-number { font-size: 2.75rem; }
    :global(.article-layout) .journey-step-track { height: 4px; }
    :global(.article-layout) .journey-stories { gap: 8px; }
    :global(.article-layout) .journey-bonus { flex-basis: 6.5rem; padding-left: 20px; }
  }

  @media (max-width: 600px) {
    .edition-journey { padding: 16px 20px 14px; }
    .journey-heading { margin-bottom: 13px; }
    .journey-caption { font-size: .75rem; }
  }

  @media (max-width: 360px) {
    .edition-journey { padding-left: 16px; padding-right: 16px; }
    .journey-map { gap: 8px; }
    .journey-bonus { flex-basis: 4.375rem; padding-left: 8px; }
    .journey-stories { gap: 3px; }
    .journey-step-number { width: 21px; height: 21px; font-size: .6875rem; }
    .journey-eyebrow { font-size: .75rem; letter-spacing: .07em; }
  }

  @container edition-journey (max-width: 14rem) {
    .journey-map { flex-wrap: wrap; gap: 14px; }
    .journey-stories { flex-basis: 100%; }
    .journey-bonus { flex: 1; flex-direction: row; justify-content: flex-end; gap: 8px; border-left: 0; padding-left: 0; }
    .journey-bonus-marker { flex-shrink: 0; }
  }

  @media (prefers-reduced-motion: reduce) {
    .journey-step-number, .journey-step-track, .journey-bonus-marker { transition: none; }
  }
</style>
