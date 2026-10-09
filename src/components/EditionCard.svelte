<script lang="ts">
  import type { Snippet } from 'svelte';
  import { storySections, type Story } from '../data';
  import assets from '../image-assets.json';
  import ResponsiveImage from './ResponsiveImage.svelte';

  let { story, number, total, collected, compact = false, children }: {
    story: Story;
    number: number;
    total: number;
    collected: boolean;
    compact?: boolean;
    children?: Snippet;
  } = $props();
  let serial = $derived(String(number).padStart(2, '0'));
  let denominator = $derived(String(total).padStart(2, '0'));
</script>

<div class="edition-card" class:card-collected={collected} class:card-compact={compact} data-card-number={number}>
  <div class="card-edition-line">
    <span class="card-series">The daily set</span>
    <span class="card-serial" aria-label={`Story card ${number} of ${total}`}>
      <strong>{serial}</strong><span> / {denominator}</span>
    </span>
  </div>
  {#if compact}
    <div class="card-thumbnail">
      <ResponsiveImage class="collection-image" image={story.image as keyof typeof assets} alt="" sizes="(max-width: 600px) 45vw, 220px" loading="lazy" />
      {#if collected}<span class="card-photo-stamp" aria-hidden="true"><svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2"><path d="m5 10 3 3 7-7" /></svg></span>{/if}
    </div>
    <div class="card-mini-copy">
      <span>{storySections[story.id] || 'News'}</span>
      <h3>{story.title.replace(/\n/g, ' ')}</h3>
    </div>
  {:else if children}
    {@render children()}
  {/if}
  <div class="card-status-line">
    <span class="card-section">{compact ? `No. ${serial}` : `${storySections[story.id] || 'News'} · No. ${serial}`}</span>
    <span class="card-state">
      {#if collected}
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="m3.5 8 3 3 6-6" /></svg>
      {:else}<span class="card-state-dot" aria-hidden="true"></span>{/if}
      {collected ? 'Collected' : compact ? 'To collect' : 'Read to collect'}
    </span>
  </div>
</div>

<style>
  .edition-card {
    position: relative;
    min-width: 0;
    overflow: hidden;
    color: var(--edition-ink);
    background: color-mix(in srgb, var(--edition-bg) 55%, #fff);
    border: 1px solid color-mix(in srgb, var(--publication-brand) 28%, transparent);
    border-top: 4px solid var(--publication-brand);
    border-radius: 3px;
    box-shadow: 5px 5px 0 color-mix(in srgb, var(--publication-brand) 7%, transparent);
  }
  .card-edition-line { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; padding: 12px 24px; border-bottom: 1px solid color-mix(in srgb, var(--publication-brand) 17%, transparent); }
  .card-series { color: var(--publication-brand); font-family: 'DM Sans', sans-serif; font-size: .75rem; font-weight: 700; letter-spacing: .13em; text-transform: uppercase; }
  .card-serial { flex-shrink: 0; font-family: 'Manrope', sans-serif; color: color-mix(in srgb, var(--edition-ink) 58%, var(--edition-bg)); font-size: .75rem; white-space: nowrap; }
  .card-serial strong { color: var(--edition-ink); font-size: 2rem; font-weight: 800; line-height: 1; letter-spacing: -.06em; font-variant-numeric: tabular-nums; }
  .card-status-line { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px 14px; padding: 13px 24px; border-top: 1px solid color-mix(in srgb, var(--publication-brand) 17%, transparent); font-family: 'DM Sans', sans-serif; font-size: .75rem; line-height: 1.4; }
  .card-section { color: color-mix(in srgb, var(--edition-ink) 62%, var(--edition-bg)); }
  .card-state { display: inline-flex; align-items: center; gap: 5px; color: var(--publication-brand); font-weight: 700; }
  .card-state svg { width: 16px; height: 16px; }
  .card-state-dot { width: 5px; height: 5px; border: 1px solid currentColor; border-radius: 50%; }
  .card-collected .card-status-line { background: color-mix(in srgb, var(--publication-brand) 5%, transparent); }
  .card-thumbnail { position: relative; aspect-ratio: 16/11; overflow: hidden; background: color-mix(in srgb, var(--publication-brand) 8%, transparent); }
  .card-thumbnail :global(picture) { display: block; width: 100%; height: 100%; }
  .card-thumbnail :global(.collection-image) { display: block; width: 100%; height: 100%; object-fit: cover; transition: opacity .25s; opacity: 0; }
  .card-thumbnail :global(.collection-image.loaded) { opacity: 1; }
  .card-photo-stamp { position: absolute; right: 10px; bottom: 10px; display: grid; place-items: center; width: 30px; height: 30px; border: 2px solid #fff; border-radius: 50%; background: var(--publication-brand); color: #fff; box-shadow: 0 3px 10px #0003; }
  .card-photo-stamp svg { width: 20px; height: 20px; }
  .card-mini-copy { padding: 13px 14px 18px; flex: 1; }
  .card-mini-copy>span { color: var(--publication-brand); font-size: .6875rem; font-weight: 700; letter-spacing: .05em; text-transform: uppercase; }
  .card-mini-copy h3 { margin: 7px 0 0; color: var(--edition-ink); font-family: var(--article-title-font, 'Manrope', sans-serif); font-size: 1.125rem; font-weight: 800; line-height: 1.16; letter-spacing: -.035em; text-wrap: balance; overflow-wrap: anywhere; }
  .card-compact { display: flex; flex-direction: column; height: 100%; box-shadow: 3px 3px 0 color-mix(in srgb, var(--publication-brand) 7%, transparent); }
  .card-compact .card-edition-line { padding: 10px 14px; gap: 7px; }
  .card-compact .card-series { font-size: .5625rem; letter-spacing: .07em; }
  .card-compact .card-serial { font-size: .5625rem; }
  .card-compact .card-serial strong { font-size: 1.375rem; }
  .card-compact .card-status-line { padding: 10px 14px; font-size: .6875rem; gap: 4px 8px; }
  .card-compact .card-state svg { width: 13px; height: 13px; }

  @media (max-width: 600px) {
    .card-edition-line { padding: 12px 18px; }
    .card-status-line { padding: 12px 18px; }
  }
  @media (max-width: 360px) {
    .card-compact .card-edition-line { flex-wrap: wrap; }
    .card-compact .card-series { font-size: .625rem; }
    .card-compact .card-status-line { padding: 10px; }
    .card-compact .card-section { display: none; }
  }
  @media (prefers-reduced-motion: reduce) { .card-thumbnail :global(.collection-image) { transition: none; } }
</style>
