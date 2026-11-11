<script lang="ts">
  import { readerContext, type Publication } from '../data';
  import { newsletterState, subscribeToNewsletter } from '../newsletter.svelte';

  let { publication }: { publication: Publication } = $props();
  let publicationId = $derived(publication.theme === 'cms' && readerContext.edition
    ? `cms-publication-${readerContext.edition.publication.id}` : publication.id);
  let subscribed = $derived(newsletterState.subscriptions.includes(publicationId));
</script>

<aside class="newsletter-signup" class:subscribed aria-label={`${publication.name} newsletter`}>
  <div class="newsletter-heading">
    <span class="newsletter-icon" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m4 6 8 7 8-7" /></svg>
    </span>
    <span class="newsletter-eyebrow">The newsletter edition</span>
  </div>
  <h3>{publication.name},<br />in your inbox.</h3>
  <p>The stories you love, in one email edition.</p>
  <button type="button" onclick={() => subscribeToNewsletter(publicationId)} aria-pressed={subscribed} disabled={subscribed}>
    {#if subscribed}<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="m4 10 4 4 8-8" /></svg>{/if}
    <span aria-live="polite">{subscribed ? 'You’re subscribed' : 'Enable newsletter'}</span>
    {#if !subscribed}<span class="newsletter-arrow" aria-hidden="true">↗</span>{/if}
  </button>
</aside>

<style>
  .newsletter-signup { margin: 32px 0; padding: 23px; border: 1px solid color-mix(in srgb, var(--publication-brand) 24%, transparent); border-top: 4px solid var(--publication-brand); border-radius: 3px; color: var(--edition-ink); background: color-mix(in srgb, var(--publication-brand) 5%, var(--edition-bg)); font-family: 'DM Sans', sans-serif; }
  .newsletter-heading { display: flex; align-items: center; gap: 10px; margin-bottom: 17px; color: var(--publication-brand); }
  .newsletter-icon { display: grid; place-items: center; width: 32px; height: 32px; flex-shrink: 0; border: 1px solid color-mix(in srgb, var(--publication-brand) 28%, transparent); border-radius: 50%; }
  .newsletter-icon svg { width: 18px; height: 18px; }
  .newsletter-eyebrow { font-size: .625rem; line-height: 1.4; font-weight: 800; letter-spacing: .1em; text-transform: uppercase; }
  .newsletter-signup h3 { margin: 0 0 12px; color: var(--edition-ink); font-family: var(--article-title-font, 'Manrope', sans-serif); font-size: 1.75rem; font-weight: 800; line-height: 1.08; letter-spacing: -.04em; text-wrap: balance; overflow-wrap: anywhere; }
  .newsletter-signup p { margin: 0 0 20px; color: color-mix(in srgb, var(--edition-ink) 72%, var(--edition-bg)); font: 400 .875rem/1.5 'DM Sans', sans-serif; }
  .newsletter-signup button { display: flex; align-items: center; justify-content: center; gap: 10px; width: 100%; min-height: 46px; padding: 12px 15px; border: 1px solid var(--publication-brand); border-radius: 3px; background: var(--publication-brand); color: #fff; font: 700 .8125rem/1.4 'DM Sans', sans-serif; }
  .newsletter-arrow { margin-left: auto; font-size: 1.125rem; line-height: 1; }
  .newsletter-signup button svg { width: 18px; height: 18px; }
  .newsletter-signup button:focus-visible { outline-color: var(--publication-brand); }
  .subscribed button { opacity: 1; background: color-mix(in srgb, var(--publication-brand) 9%, var(--edition-bg)); color: var(--publication-brand); border-color: color-mix(in srgb, var(--publication-brand) 35%, transparent); }
  @media (max-width: 360px) { .newsletter-signup { padding: 19px; } .newsletter-signup h3 { font-size: 1.5rem; } }
</style>
