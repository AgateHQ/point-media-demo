<script lang="ts">
  import { demo } from '../demo.svelte';
  import type { DiscoverPublication } from '../discover';
  import PublicationLogo from './PublicationLogo.svelte';
  import ResponsiveImage from './ResponsiveImage.svelte';

  let { editions, disabled = false, onselect }: {
    editions: DiscoverPublication[];
    disabled?: boolean;
    onselect: (edition: DiscoverPublication) => void;
  } = $props();
  let shelves = $derived(Array.from({ length: Math.ceil(editions.length / 3) }, (_, index) => editions.slice(index * 3, index * 3 + 3)));

  function titleFont(id: string) {
    if (id === 'the-scoop') return "'Anton', Impact, sans-serif";
    if (id === 'full-time') return "'Barlow Condensed', 'Arial Narrow', sans-serif";
    if (['evening-lantern', 'northgate-ledger'].includes(id)) return "Georgia, 'Times New Roman', serif";
    return "'Manrope', sans-serif";
  }
</script>

<section class="publication-bookshelf" id="discover-bookshelf" aria-label="Publication bookshelf">
  <h2 class="bookshelf-title">Publications</h2>
  <div class="bookshelf-rows">
    {#each shelves as shelf, row (row)}
      <div class="bookshelf-row">
        {#each shelf as edition (edition.publication.id)}
          {@const p = edition.publication}
          {@const current = p.id === demo.data.publication}
          <button class="bookshelf-publication" {disabled} onclick={() => onselect(edition)}
            aria-label={`Open ${p.name}, ${edition.articleCount} ${edition.articleCount === 1 ? 'page' : 'pages'}`}
            aria-current={current ? 'true' : undefined}
            style={`--book-brand:${p.brand};--book-paper:${p.color};--book-ink:${p.ink};--book-title-font:${titleFont(p.id)}`}>
            <span class="shelf-cover">
              <span class="shelf-masthead"><PublicationLogo publication={p} decorative /></span>
              <span class="shelf-photo">
                {#if edition.lead.image}<ResponsiveImage class="shelf-image" image={edition.lead.image} alt="" sizes="160px" priority="low" loading="lazy" />{/if}
              </span>
              <span class="shelf-cover-copy"><strong>{edition.lead.title.replace(/\n/g, ' ')}</strong></span>
            </span>
          </button>
        {/each}
      </div>
    {/each}
  </div>
</section>

<style>
  .publication-bookshelf { position: absolute; inset: 0; container-type: inline-size; display: flex; flex-direction: column; overflow-y: auto; overscroll-behavior: contain; padding: max(100px, calc(env(safe-area-inset-top) + 80px)) 24px max(64px, calc(env(safe-area-inset-bottom) + 40px)); background: radial-gradient(ellipse at 30% 10%, #fafafa, #eeeeed 75%); }
  .bookshelf-title { position: absolute; width: 1px; height: 1px; margin: -1px; padding: 0; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
  .bookshelf-rows { display: grid; flex-shrink: 0; gap: clamp(52px, 9dvh, 84px); width: 100%; margin: auto 0; }
  .bookshelf-row { position: relative; display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); align-items: end; justify-items: center; gap: 24px; padding: 0 13px 14px; }
  .bookshelf-row::after { content: ''; position: absolute; left: 0; right: 0; bottom: 5px; height: 5px; border-top: 1px solid #fff; border-radius: 1px; background: #fafafa; box-shadow: 0 12px 18px #0000001a, 0 3px 4px #00000008; pointer-events: none; }
  .bookshelf-publication { position: relative; z-index: 1; display: block; width: 100%; min-width: 0; max-width: 150px; padding: 0; border: 0; background: transparent; text-align: left; }
  .bookshelf-publication:hover { filter: none !important; }
  .shelf-cover { position: relative; isolation: isolate; display: flex; flex-direction: column; width: 100%; aspect-ratio: 2 / 3; overflow: hidden; border: 1px solid #0000000d; border-radius: 1px 2px 2px 1px; color: var(--book-ink); background: var(--book-paper); box-shadow: 1px 1px 0 #fff9 inset, 6px 5px 10px #0000000f, 12px 12px 23px #00000012; transition: transform var(--motion-duration-quick) var(--motion-ease-standard); }
  .shelf-cover::after { content: ''; position: absolute; z-index: 2; inset: 0; background: linear-gradient(90deg, #0000000c, #ffffff66 2%, #00000008 4%, transparent 7%); pointer-events: none; }
  .bookshelf-publication:hover .shelf-cover, .bookshelf-publication:focus-visible .shelf-cover { transform: translateY(-3px); }
  .bookshelf-publication:focus-visible { outline: 2px solid var(--book-brand); outline-offset: 7px; border-radius: 2px; }
  .shelf-masthead { display: flex; align-items: center; justify-content: center; height: clamp(22px, 7cqw, 30px); flex-shrink: 0; padding: 5px 6px; background: #fff; }
  .shelf-masthead :global(.publication-logo) { width: 100%; height: 100%; object-fit: contain; object-position: center; }
  .shelf-photo { display: block; height: 40%; flex-shrink: 0; overflow: hidden; background: color-mix(in srgb, var(--book-brand) 10%, var(--book-paper)); }
  .shelf-photo :global(picture) { display: block; width: 100%; height: 100%; }
  .shelf-photo :global(.shelf-image) { display: block; width: 100%; height: 100%; object-fit: cover; }
  .shelf-cover-copy { display: block; flex: 1; min-height: 0; padding: 8px 7px; overflow: hidden; }
  .shelf-cover-copy strong { display: -webkit-box; -webkit-line-clamp: 3; line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; color: var(--book-ink); font: 800 clamp(.625rem, 3.1cqw, .875rem)/1.12 var(--book-title-font); letter-spacing: -.025em; }
  @media (max-width: 360px) { .publication-bookshelf { padding-right: 18px; padding-left: 18px; } .bookshelf-row { gap: 16px; padding-right: 10px; padding-left: 10px; } .shelf-cover-copy { padding: 6px; } }
  @media (prefers-reduced-motion: reduce) { .shelf-cover { transition: none; } .bookshelf-publication:hover .shelf-cover, .bookshelf-publication:focus-visible .shelf-cover { transform: none; } }
</style>
