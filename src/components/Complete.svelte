<script lang="ts">
  import { onMount } from 'svelte';
  import { demo, currentPub, editionXp, getStories, networkXp, pubCollected, readingStreak, recentReadingHistory, xpRules, home, openStory, openSheet, selectPublication } from '../demo.svelte';
  import { publications, stories, nextPublicationId } from '../data';
  import Icon from './Icon.svelte';
  let pub = $derived(currentPub());
  let nextPub = $derived(publications.find(item => item.id === nextPublicationId(pub.id))!);
  let preview = $derived(stories[nextPub.storyOrder[3]]);
  let streak = $derived(readingStreak());
  let recentDays = $derived(recentReadingHistory());
  let collectedIds = $derived(pubCollected());
  let collectedCount = $derived(getStories().filter(story => collectedIds.includes(story.id)).length);
  let storyTotal = $derived(getStories().length);
  let perfectEdition = $derived(collectedCount === storyTotal);
  let xp = $derived(editionXp());
  let allXp = $derived(networkXp());
  let completionPercent = $state(0);

  onMount(() => {
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let frame = 0;
    let started = 0;
    const finish = () => { completionPercent = 100; if (frame) cancelAnimationFrame(frame); frame = 0; };
    const draw = (time: number) => {
      if (!started) started = time;
      const progress = Math.max(0, Math.min(1, (time - started - 180) / 1100));
      const eased = 1 - Math.pow(1 - progress, 3);
      completionPercent = Math.round(eased * 100);
      if (progress < 1) frame = requestAnimationFrame(draw);
      else frame = 0;
    };
    const motionChanged = () => { if (motion.matches) finish(); };
    if (motion.matches) completionPercent = 100;
    else frame = requestAnimationFrame(draw);
    motion.addEventListener('change', motionChanged);
    return () => { if (frame) cancelAnimationFrame(frame); motion.removeEventListener('change', motionChanged); };
  });

  function again() { home(); }
  function last() { openStory(getStories()[7].id); }
  function nextEdition() { selectPublication(pub.id === 'pitchline' ? 'the-scoop' : ['the-scoop','brightwire','full-time','evening-lantern','northgate-ledger','pitchline'][(['the-scoop','brightwire','full-time','evening-lantern','northgate-ledger','pitchline'].indexOf(pub.id) + 1) % 6]); }
</script>

<div class="completion" aria-labelledby="completion-title">
  <div class="completion-top"><button class="completion-back" onclick={last} aria-label="Back to the last article"><Icon /><span>Last article</span></button></div>
  <section class="completion-celebration" data-completion-celebration>
    <div class="completion-kicker"><span>Edition complete</span><span>{pub.name}</span></div>
    <div class="completion-passage">
      <div class="completion-ring" role="progressbar" aria-label="Today’s edition completion"
        aria-valuemin="0" aria-valuemax="100" aria-valuenow={completionPercent}
        aria-valuetext={`${completionPercent}% complete. ${storyTotal} of ${storyTotal} stories read.`}>
        <svg viewBox="0 0 96 96" fill="none" aria-hidden="true">
          <circle class="completion-ring-track" cx="48" cy="48" r="40" pathLength="100" />
          <circle class="completion-ring-fill" cx="48" cy="48" r="40" pathLength="100" stroke-dashoffset={100 - completionPercent} />
        </svg>
        <div class="completion-ring-value" aria-hidden="true"><strong>{completionPercent}<small>%</small></strong><span>{String(storyTotal).padStart(2, '0')} / {String(storyTotal).padStart(2, '0')}</span></div>
      </div>
      <div class="completion-bridge" aria-hidden="true">
        <span></span>
        <svg viewBox="0 0 24 24" fill="none"><path d="m12 1.5 2.3 8.2L22.5 12l-8.2 2.3-2.3 8.2-2.3-8.2L1.5 12l8.2-2.3L12 1.5Z" /></svg>
        <span></span>
      </div>
      <div class="completion-bonus" aria-hidden="true"><span>Unlocked</span><strong>{String(storyTotal + 1).padStart(2, '0')}</strong></div>
      <span class="completion-sr-only">Preview {storyTotal + 1} unlocked.</span>
    </div>
    <div class="completion-passage-labels" aria-hidden="true"><span>Today’s edition</span><span>Just for you</span></div>
    <h1 id="completion-title">The edition is read.<br /><em>The ninth is yours.</em></h1>
    <p>Eight stories close today’s issue. Your private proof of tomorrow’s edition follows.</p>
  </section>
  <section class="reader-record" aria-labelledby="reader-record-title">
    <header class="reader-record-heading">
      <div><span>Reader’s record</span><h2 id="reader-record-title">Today’s issue, in full</h2></div>
      <small>Filed · 08 / 08</small>
    </header>
    <div class="stats"><div><strong>8</strong><span>ARTICLES READ</span></div><div><strong>{streak} {streak === 1 ? 'day' : 'days'}</strong><span>READING RUN</span></div><div><strong>{demo.data.reward ? '10p' : '0p'}</strong><span>READER CREDIT</span></div></div>
    <section class="streak-card" aria-labelledby="streak-title" data-reading-streak>
    <div class="streak-summary">
      <span class="streak-flame" class:flame-lit={streak > 0} aria-hidden="true">
        <svg viewBox="0 0 40 48" fill="none"><path class="flame-outer" d="M21 2c2 9-4 12-2 19 2-3 5-5 8-6 0 6 8 9 8 18 0 8-6 13-15 13S5 41 5 32c0-8 5-13 10-18 1 5 2 7 4 8-2-8 4-12 2-20Z" /><path class="flame-inner" d="M21 25c1 5-4 7-2 12 1-2 3-3 5-4 1 2 3 4 3 7 0 4-3 6-7 6s-7-3-7-7c0-5 4-8 6-11 0 3 1 5 2 6 0-3 1-5 0-9Z" /></svg>
      </span>
      <div><span>Reading rhythm</span><h2 id="streak-title">{streak} consecutive {streak === 1 ? 'day' : 'days'}</h2><p>{streak > 1 ? `${streak} daily editions, read without a break.` : 'The first entry in a new reading run.'}</p></div>
    </div>
    <ol class="streak-history" aria-label="Recent reading days">
      {#each recentDays as day (day.key)}
        <li class:day-read={day.read} class:day-today={day.today} aria-label={`${day.label} ${day.date}: ${day.read ? 'edition completed' : 'no edition completed'}`}>
          <span>{day.label}</span><i aria-hidden="true">{#if day.read}<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8"><path d="m3.5 8 3 3 6-6" /></svg>{/if}</i><small>{day.date}</small>
        </li>
      {/each}
    </ol>
    </section>
    <section class="xp-ledger" aria-labelledby="xp-title" data-edition-xp>
    <header class="xp-heading">
      <div><span>Edition ledger</span><h2 id="xp-title">Reading credit</h2></div>
      <strong><span aria-hidden="true">+</span>{xp.total}<small> XP</small></strong>
    </header>
    <dl class="xp-breakdown">
      <div><dt>Opened<small>{xp.unlockCount} × {xpRules.unlock} XP</small></dt><dd>+{xp.unlockXp}</dd></div>
      <div><dt>Finished<small>{xp.fullReadCount} × {xpRules.fullRead} XP</small></dt><dd>+{xp.fullReadXp}</dd></div>
      <div><dt>Issue filed<small>{xp.completionXp ? 'Edition closed' : 'Still reading'}</small></dt><dd>+{xp.completionXp}</dd></div>
    </dl>
    <footer class="xp-total"><span>Network record</span><strong>{allXp} XP</strong><small>Each reading entry is recorded once; rereading never alters the total.</small></footer>
    </section>
    <section class="perfect-badge" class:perfect-earned={perfectEdition} aria-labelledby="perfect-badge-title" data-perfect-edition-badge>
    <div class="perfect-seal" aria-hidden="true">
      <svg viewBox="0 0 88 96" fill="none">
        <path class="perfect-ribbon" d="m25 60-5 31 23-11L28 62m35-2 5 31-23-11 15-18" />
        <path class="perfect-rosette" d="m44 3 7 7 10-3 3 10 10 3-3 10 7 7-7 7 3 10-10 3-3 10-10-3-7 7-7-7-10 3-3-10-10-3 3-10-7-7 7-7-3-10 10-3 3-10 10 3 7-7Z" />
        <circle cx="44" cy="37" r="22" />
        {#if perfectEdition}<path class="perfect-check" d="m33 37 7 7 15-16" />{:else}<path class="perfect-star" d="m44 24 3.2 9.8L57 37l-9.8 3.2L44 50l-3.2-9.8L31 37l9.8-3.2L44 24Z" />{/if}
      </svg>
    </div>
    <div class="perfect-copy">
      <span class="perfect-kicker">{perfectEdition ? 'Reader’s seal · Filed' : 'Reader’s seal · In progress'}</span>
      <h2 id="perfect-badge-title">Perfect edition</h2>
      <p>{perfectEdition
        ? `Every full story collected in ${pub.name}. The complete issue is now in your set.`
        : `${storyTotal - collectedCount} ${storyTotal - collectedCount === 1 ? 'full story remains' : 'full stories remain'} to complete your daily set.`}</p>
      {#if !perfectEdition}
        <div class="perfect-progress" role="progressbar" aria-label="Progress towards the Perfect edition badge"
          aria-valuemin="0" aria-valuemax={storyTotal} aria-valuenow={collectedCount}
          aria-valuetext={`${collectedCount} of ${storyTotal} full stories collected`}>
          {#each getStories() as item (item.id)}<span class:progress-earned={collectedIds.includes(item.id)} aria-hidden="true"></span>{/each}
        </div>
      {/if}
    </div>
    <div class="perfect-meta">
      <strong>{perfectEdition ? '08 / 08' : `${String(collectedCount).padStart(2, '0')} / ${String(storyTotal).padStart(2, '0')}`}</strong>
      <button onclick={() => openSheet('collection')} aria-label="View your daily set">View set <span aria-hidden="true">↗</span></button>
    </div>
    </section>
  </section>
  <article class="secret-preview" aria-labelledby="secret-preview-title" data-secret-preview
    style={`--secret-brand:${nextPub.brand};--secret-header:${nextPub.header};--secret-paper:${nextPub.color};--secret-ink:${nextPub.ink}`}>
    <span class="secret-watermark" aria-hidden="true">09</span>
    <header class="secret-heading">
      <span class="secret-lock" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M8 10V7.5a4 4 0 0 1 7.7-1.55" /><rect x="5" y="10" width="14" height="10" rx="1.5" /><path d="M12 14v2.5" /></svg>
      </span>
      <div><span>Next edition unlocked</span><small>Private reader proof</small></div>
      <strong aria-hidden="true">09</strong>
    </header>
    <div class="secret-divider"><span>Advance copy · keep under wraps</span></div>
    <div class="secret-copy">
      <small>{nextPub.name.toUpperCase()} · THE NEXT EDITION</small>
      <h2 id="secret-preview-title">{preview.title.replace(/\n/g, ' ')}</h2>
      <p>{preview.subtitle}</p>
    </div>
    <footer class="secret-footer">
      <span><svg viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.3" aria-hidden="true"><path d="m9 2 1.7 5.3L16 9l-5.3 1.7L9 16l-1.7-5.3L2 9l5.3-1.7L9 2Z" /></svg>Issued after 08 / 08</span>
      <strong>ACCESS 09</strong>
    </footer>
  </article>
  <button class="primary" onclick={nextEdition} style:background={pub.accent}>Explore another edition <Icon /></button>
  <button class="completion-secondary" onclick={() => openSheet('collection')}>Your daily set · {collectedCount} / {storyTotal} collected</button>
  <button class="completion-secondary" onclick={again}>Read this edition again</button>
  <button class="completion-network-cue" onclick={() => openSheet('network')} style={`--completion-accent:${pub.accent}`}><span><Icon /></span><strong>Swipe up to see the rest of the network</strong></button>
</div>

<style>
  .completion-celebration {
    position: relative;
    margin-top: 18px;
    padding: 22px 0 27px;
    border-top: 1px solid color-mix(in srgb, var(--publication-brand) 27%, transparent);
    border-bottom: 1px solid color-mix(in srgb, var(--publication-brand) 27%, transparent);
  }
  .completion-kicker { display: flex; align-items: center; justify-content: space-between; gap: 16px; color: var(--publication-brand); font-size: .6875rem; font-weight: 800; line-height: 1.3; letter-spacing: .12em; text-transform: uppercase; }
  .completion-kicker span:last-child { color: color-mix(in srgb, var(--edition-ink) 58%, var(--edition-bg)); font-weight: 600; letter-spacing: .08em; text-align: right; }
  .completion-passage { display: grid; grid-template-columns: 5.25rem minmax(3.25rem, 1fr) 5.25rem; align-items: center; gap: 13px; margin: 25px 0 8px; }
  .completion-ring { position: relative; display: grid; place-items: center; width: 5.25rem; aspect-ratio: 1; font-family: 'Manrope', sans-serif; }
  .completion-ring>svg { position: absolute; inset: 0; display: block; width: 100%; height: 100%; overflow: visible; transform: rotate(-90deg); }
  .completion-ring-track { stroke: color-mix(in srgb, var(--publication-brand) 14%, transparent); stroke-width: 3; }
  .completion-ring-fill { stroke: var(--publication-brand); stroke-width: 4; stroke-linecap: round; stroke-dasharray: 100; transition: stroke-dashoffset 55ms linear; filter: drop-shadow(0 1px 2px color-mix(in srgb, var(--publication-brand) 18%, transparent)); }
  .completion-ring-value { position: relative; display: flex; flex-direction: column; align-items: center; gap: 4px; }
  .completion-ring-value strong { color: var(--edition-ink); font-size: 1.55rem; font-weight: 800; line-height: .9; letter-spacing: -.07em; font-variant-numeric: tabular-nums; }
  .completion-ring-value small { margin-left: 1px; color: var(--publication-brand); font-size: .625rem; letter-spacing: 0; }
  .completion-ring-value span { color: color-mix(in srgb, var(--edition-ink) 57%, var(--edition-bg)); font-size: .5rem; font-weight: 800; line-height: 1; letter-spacing: .08em; }
  .completion-bridge { display: grid; grid-template-columns: 1fr 24px 1fr; align-items: center; gap: 6px; color: var(--publication-brand); }
  .completion-bridge span { height: 1px; background: currentColor; transform-origin: center; animation: completion-line .65s .12s cubic-bezier(.22, 1, .36, 1) both; }
  .completion-bridge svg { width: 24px; height: 24px; overflow: visible; fill: var(--edition-bg); stroke: currentColor; stroke-width: 1.25; animation: completion-spark .7s .22s cubic-bezier(.22, 1, .36, 1) both; }
  .completion-bonus { display: flex; flex-direction: column; justify-content: center; align-items: center; width: 5.25rem; aspect-ratio: 1; border-radius: 50%; color: var(--publication-brand-ink); background: var(--publication-brand); box-shadow: 0 0 0 6px color-mix(in srgb, var(--publication-brand) 9%, transparent); animation: completion-unlock .72s .25s cubic-bezier(.22, 1, .36, 1) both; }
  .completion-bonus span { font-size: .5rem; font-weight: 800; letter-spacing: .12em; text-transform: uppercase; }
  .completion-bonus strong { font-family: 'Manrope', sans-serif; font-size: 2.25rem; font-weight: 800; line-height: .92; letter-spacing: -.07em; font-variant-numeric: tabular-nums; }
  .completion-passage-labels { display: flex; align-items: center; justify-content: space-between; padding-right: 3px; color: color-mix(in srgb, var(--edition-ink) 55%, var(--edition-bg)); font-size: .5625rem; font-weight: 700; letter-spacing: .11em; text-transform: uppercase; }
  .completion-sr-only { position: absolute; width: 1px; height: 1px; margin: -1px; padding: 0; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
  .completion-celebration h1 { margin: 30px 0 15px; color: var(--edition-ink); font-family: var(--article-title-font, 'Manrope', sans-serif); font-size: clamp(2.5rem, 11vw, 3.65rem); font-weight: 800; line-height: 1.02; letter-spacing: -.055em; text-wrap: balance; animation: completion-copy .62s .38s cubic-bezier(.22, 1, .36, 1) both; }
  .completion-celebration h1 em { color: var(--publication-brand); font-style: normal; }
  .completion-celebration>p { max-width: 30rem; margin: 0; color: color-mix(in srgb, var(--edition-ink) 72%, var(--edition-bg)); font-size: .9375rem; line-height: 1.6; animation: completion-copy .62s .46s cubic-bezier(.22, 1, .36, 1) both; }
  .reader-record { margin: 23px 0 22px; padding: 17px 0 20px; border-top: 3px double color-mix(in srgb, var(--edition-ink) 38%, transparent); border-bottom: 1px solid color-mix(in srgb, var(--edition-ink) 25%, transparent); }
  .reader-record-heading { display: flex; align-items: flex-end; justify-content: space-between; gap: 18px; }
  .reader-record-heading>div>span { display: block; margin-bottom: 4px; color: var(--publication-brand); font-size: .5625rem; font-weight: 800; letter-spacing: .14em; text-transform: uppercase; }
  .reader-record-heading h2 { margin: 0; color: var(--edition-ink); font-family: var(--article-title-font, 'Manrope', sans-serif); font-size: 1.4rem; font-weight: 800; line-height: 1.12; letter-spacing: -.035em; }
  .reader-record-heading>small { padding-bottom: 2px; color: color-mix(in srgb, var(--edition-ink) 54%, var(--edition-bg)); font-size: .5625rem; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; white-space: nowrap; }
  .reader-record>.stats { margin: 16px 0 0; }
  .streak-card { margin: 19px 0 20px; padding: 17px; border: 1px solid color-mix(in srgb, var(--publication-brand) 20%, transparent); border-radius: 3px; color: var(--edition-ink); background: color-mix(in srgb, var(--publication-brand) 2.5%, var(--edition-bg)); }
  .streak-summary { display: flex; align-items: center; gap: 13px; }
  .streak-flame { display: grid; place-items: center; flex: 0 0 48px; width: 48px; height: 48px; border-radius: 50%; color: color-mix(in srgb, var(--edition-ink) 28%, var(--edition-bg)); background: color-mix(in srgb, var(--edition-ink) 4%, var(--edition-bg)); box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--edition-ink) 10%, transparent); }
  .streak-flame svg { width: 25px; height: 30px; }
  .flame-outer { fill: currentColor; }
  .flame-inner { fill: var(--edition-bg); }
  .flame-lit { color: var(--publication-brand); background: color-mix(in srgb, var(--publication-brand) 9%, var(--edition-bg)); box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--publication-brand) 22%, transparent); }
  .streak-summary>div { min-width: 0; }
  .streak-summary>div>span { display: block; margin-bottom: 3px; color: var(--publication-brand); font-size: .5625rem; font-weight: 800; letter-spacing: .12em; text-transform: uppercase; }
  .streak-summary h2 { margin: 0; color: var(--edition-ink); font-family: 'Manrope', sans-serif; font-size: 1.125rem; font-weight: 800; line-height: 1.2; letter-spacing: -.03em; }
  .streak-summary p { margin: 4px 0 0; color: color-mix(in srgb, var(--edition-ink) 61%, var(--edition-bg)); font-size: .6875rem; line-height: 1.4; }
  .streak-history { display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); gap: 5px; margin: 15px 0 0; padding: 14px 0 0; border-top: 1px solid color-mix(in srgb, var(--publication-brand) 14%, transparent); list-style: none; }
  .streak-history li { display: flex; flex-direction: column; align-items: center; gap: 5px; min-width: 0; color: color-mix(in srgb, var(--edition-ink) 43%, var(--edition-bg)); }
  .streak-history li>span { width: 100%; overflow: hidden; font-size: .5rem; font-weight: 700; line-height: 1; letter-spacing: .02em; text-align: center; text-overflow: ellipsis; text-transform: uppercase; white-space: nowrap; }
  .streak-history i { display: grid; place-items: center; width: 24px; height: 24px; border: 1px solid color-mix(in srgb, var(--edition-ink) 13%, transparent); border-radius: 50%; background: var(--edition-bg); }
  .streak-history i svg { width: 13px; height: 13px; }
  .streak-history small { font-size: .5625rem; font-variant-numeric: tabular-nums; }
  .streak-history .day-read { color: var(--publication-brand); }
  .streak-history .day-read i { color: var(--publication-brand-ink); background: var(--publication-brand); border-color: var(--publication-brand); }
  .streak-history .day-today i { box-shadow: 0 0 0 3px color-mix(in srgb, var(--publication-brand) 10%, transparent); }
  .streak-history .day-today>span { color: var(--edition-ink); font-weight: 800; }
  .xp-ledger { margin: 19px 0 20px; padding: 18px 17px 15px; border-top: 3px solid var(--publication-brand); border-right: 1px solid color-mix(in srgb, var(--publication-brand) 20%, transparent); border-bottom: 1px solid color-mix(in srgb, var(--publication-brand) 20%, transparent); border-left: 1px solid color-mix(in srgb, var(--publication-brand) 20%, transparent); border-radius: 3px; color: var(--edition-ink); background: color-mix(in srgb, var(--publication-brand) 3%, var(--edition-bg)); }
  .xp-heading { display: flex; align-items: flex-start; justify-content: space-between; gap: 18px; }
  .xp-heading>div { display: flex; flex-direction: column; gap: 4px; }
  .xp-heading>div>span { color: var(--publication-brand); font-size: .5625rem; font-weight: 800; line-height: 1.2; letter-spacing: .13em; text-transform: uppercase; }
  .xp-heading h2 { margin: 0; color: var(--edition-ink); font-family: 'Manrope', sans-serif; font-size: 1.25rem; font-weight: 800; line-height: 1.1; letter-spacing: -.035em; }
  .xp-heading>strong { color: var(--publication-brand); font-family: 'Manrope', sans-serif; font-size: 2rem; font-weight: 800; line-height: .9; letter-spacing: -.06em; font-variant-numeric: tabular-nums; white-space: nowrap; }
  .xp-heading>strong>span { margin-right: 1px; font-size: 1rem; vertical-align: .25em; }
  .xp-heading>strong>small { font-size: .625rem; letter-spacing: .06em; }
  .xp-breakdown { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); margin: 16px 0 14px; padding: 14px 0; border-top: 1px solid color-mix(in srgb, var(--publication-brand) 16%, transparent); border-bottom: 1px solid color-mix(in srgb, var(--publication-brand) 16%, transparent); }
  .xp-breakdown>div { min-width: 0; padding: 0 11px; }
  .xp-breakdown>div:first-child { padding-left: 0; }
  .xp-breakdown>div:last-child { padding-right: 0; }
  .xp-breakdown>div+div { border-left: 1px solid color-mix(in srgb, var(--publication-brand) 15%, transparent); }
  .xp-breakdown dt { display: flex; flex-direction: column; gap: 5px; color: var(--edition-ink); font-size: .6875rem; font-weight: 700; line-height: 1.2; }
  .xp-breakdown dt small { color: color-mix(in srgb, var(--edition-ink) 52%, var(--edition-bg)); font-size: .5rem; font-weight: 700; letter-spacing: .05em; text-transform: uppercase; }
  .xp-breakdown dd { margin: 10px 0 0; color: var(--publication-brand); font-family: 'Manrope', sans-serif; font-size: 1.125rem; font-weight: 800; line-height: 1; font-variant-numeric: tabular-nums; }
  .xp-total { display: grid; grid-template-columns: 1fr auto; align-items: center; gap: 4px 12px; }
  .xp-total>span { color: color-mix(in srgb, var(--edition-ink) 60%, var(--edition-bg)); font-size: .625rem; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; }
  .xp-total>strong { color: var(--edition-ink); font-size: .75rem; font-variant-numeric: tabular-nums; }
  .xp-total>small { grid-column: 1 / -1; color: color-mix(in srgb, var(--edition-ink) 49%, var(--edition-bg)); font-size: .5625rem; line-height: 1.4; }
  .perfect-badge { display: grid; grid-template-columns: 68px minmax(0, 1fr) auto; align-items: center; gap: 15px; margin: 19px 0 20px; padding: 17px 16px; border: 1px dashed color-mix(in srgb, var(--publication-brand) 30%, transparent); border-radius: 3px; color: var(--edition-ink); background: color-mix(in srgb, var(--publication-brand) 2.5%, var(--edition-bg)); }
  .perfect-seal { display: grid; place-items: center; width: 68px; height: 74px; color: color-mix(in srgb, var(--edition-ink) 35%, var(--edition-bg)); }
  .perfect-seal svg { display: block; width: 100%; height: 100%; overflow: visible; }
  .perfect-ribbon { fill: color-mix(in srgb, var(--edition-ink) 5%, var(--edition-bg)); stroke: currentColor; stroke-width: 1.2; }
  .perfect-rosette { fill: var(--edition-bg); stroke: currentColor; stroke-width: 1.4; }
  .perfect-seal circle { stroke: currentColor; stroke-width: 1; stroke-dasharray: 1.5 2.5; }
  .perfect-star { fill: color-mix(in srgb, var(--edition-ink) 13%, var(--edition-bg)); stroke: currentColor; stroke-width: 1; }
  .perfect-check { stroke: var(--publication-brand-ink); stroke-width: 4; stroke-linecap: round; stroke-linejoin: round; }
  .perfect-copy { min-width: 0; }
  .perfect-kicker { display: block; margin-bottom: 5px; color: color-mix(in srgb, var(--edition-ink) 55%, var(--edition-bg)); font-size: .5625rem; font-weight: 800; line-height: 1.3; letter-spacing: .1em; text-transform: uppercase; }
  .perfect-copy h2 { margin: 0; color: var(--edition-ink); font-family: 'Manrope', sans-serif; font-size: 1rem; font-weight: 800; line-height: 1.15; letter-spacing: -.025em; }
  .perfect-copy p { margin: 5px 0 0; color: color-mix(in srgb, var(--edition-ink) 66%, var(--edition-bg)); font-size: .6875rem; line-height: 1.45; }
  .perfect-progress { display: grid; grid-template-columns: repeat(8, 1fr); gap: 3px; margin-top: 10px; }
  .perfect-progress span { height: 3px; background: color-mix(in srgb, var(--publication-brand) 13%, transparent); }
  .perfect-progress .progress-earned { background: var(--publication-brand); }
  .perfect-meta { align-self: stretch; display: flex; flex-direction: column; align-items: flex-end; justify-content: space-between; gap: 8px; padding-left: 12px; border-left: 1px solid color-mix(in srgb, var(--publication-brand) 15%, transparent); }
  .perfect-meta>strong { color: color-mix(in srgb, var(--edition-ink) 52%, var(--edition-bg)); font-size: .625rem; line-height: 1; letter-spacing: .08em; font-variant-numeric: tabular-nums; }
  .perfect-meta button { display: inline-flex; align-items: center; gap: 5px; min-height: 34px; padding: 6px 0 6px 8px; color: var(--publication-brand); background: transparent; font-size: .6875rem; font-weight: 800; white-space: nowrap; }
  .perfect-meta button:focus-visible { outline-color: var(--publication-brand); }
  .perfect-meta button span { font-size: .875rem; }
  .perfect-earned { border-style: solid; border-color: color-mix(in srgb, var(--publication-brand) 35%, transparent); background: linear-gradient(115deg, color-mix(in srgb, var(--publication-brand) 10%, var(--edition-bg)), color-mix(in srgb, var(--publication-brand) 3%, var(--edition-bg))); box-shadow: 4px 4px 0 color-mix(in srgb, var(--publication-brand) 7%, transparent); }
  .perfect-earned .perfect-seal { color: var(--publication-brand); }
  .perfect-earned .perfect-ribbon { fill: color-mix(in srgb, var(--publication-brand) 72%, var(--edition-bg)); stroke: var(--publication-brand); }
  .perfect-earned .perfect-rosette { fill: var(--publication-brand); stroke: var(--publication-brand); }
  .perfect-earned .perfect-seal circle { stroke: color-mix(in srgb, var(--publication-brand-ink) 70%, transparent); }
  .perfect-earned .perfect-kicker, .perfect-earned .perfect-meta>strong { color: var(--publication-brand); }
  .reader-record .streak-card, .reader-record .xp-ledger, .reader-record .perfect-badge { margin: 0; border: 0; border-top: 1px solid color-mix(in srgb, var(--edition-ink) 16%, transparent); border-radius: 0; background: transparent; box-shadow: none; }
  .reader-record .streak-card { padding: 19px 0 20px; }
  .reader-record .xp-ledger { padding: 20px 0; }
  .reader-record .perfect-badge { padding: 20px 0 0; }
  .reader-record .perfect-earned { background: transparent; box-shadow: none; }
  .secret-preview { position: relative; isolation: isolate; margin: 22px 0 20px; overflow: hidden; border: 1px solid color-mix(in srgb, var(--secret-paper) 24%, transparent); border-top: 4px solid var(--secret-paper); border-radius: 3px; color: #fff; background: color-mix(in srgb, var(--secret-header) 88%, #080808); box-shadow: 0 16px 34px color-mix(in srgb, var(--secret-header) 22%, transparent); }
  .secret-preview::before { content: ''; position: absolute; z-index: -1; inset: 0; opacity: .075; background: repeating-linear-gradient(135deg, transparent 0 9px, #fff 9px 10px); pointer-events: none; }
  .secret-preview::after { content: ''; position: absolute; z-index: -1; right: -55px; bottom: -78px; width: 180px; height: 180px; border: 1px solid #ffffff1f; border-radius: 50%; box-shadow: 0 0 0 22px #ffffff08,0 0 0 44px #ffffff06; pointer-events: none; }
  .secret-watermark { position: absolute; z-index: -1; right: 9px; top: 66px; color: #ffffff0a; font-family: 'Manrope', sans-serif; font-size: 8.5rem; font-weight: 800; line-height: .8; letter-spacing: -.12em; pointer-events: none; }
  .secret-heading { display: grid; grid-template-columns: 36px minmax(0, 1fr) auto; align-items: center; gap: 11px; padding: 14px 16px; border-bottom: 1px solid #ffffff1f; background: #0000001f; }
  .secret-lock { display: grid; place-items: center; width: 36px; height: 36px; border: 1px solid #ffffff2e; border-radius: 50%; background: #ffffff0c; color: var(--secret-paper); }
  .secret-lock svg { width: 20px; height: 20px; }
  .secret-heading>div { min-width: 0; }
  .secret-heading>div>span { display: block; color: #fff; font-size: .6875rem; font-weight: 800; line-height: 1.25; letter-spacing: .11em; text-transform: uppercase; }
  .secret-heading>div>small { display: block; margin-top: 4px; color: #ffffff9e; font-size: .5625rem; line-height: 1.2; letter-spacing: .08em; text-transform: uppercase; }
  .secret-heading>strong { color: var(--secret-paper); font-family: 'Manrope', sans-serif; font-size: 1.75rem; font-weight: 800; line-height: 1; letter-spacing: -.06em; }
  .secret-divider { display: flex; align-items: center; gap: 10px; padding: 10px 16px; color: #ffffff94; font-size: .5rem; font-weight: 800; letter-spacing: .13em; text-transform: uppercase; }
  .secret-divider::before, .secret-divider::after { content: ''; flex: 1; height: 1px; background: repeating-linear-gradient(90deg,#ffffff38 0 3px,transparent 3px 7px); }
  .secret-divider span { flex: 0 1 auto; text-align: center; }
  .secret-copy { position: relative; padding: 14px 20px 22px; }
  .secret-copy>small { display: block; color: var(--secret-paper); font-size: .5625rem; font-weight: 800; line-height: 1.3; letter-spacing: .13em; text-transform: uppercase; }
  .secret-copy h2 { max-width: 18rem; margin: 12px 0 8px; color: #fff; font-family: 'Manrope', sans-serif; font-size: 1.625rem; font-weight: 800; line-height: 1.08; letter-spacing: -.045em; text-wrap: balance; }
  .secret-preview .secret-copy p { max-width: 17rem; margin: 0; color: #ffffffbd; font-size: .8125rem; line-height: 1.5; }
  .secret-footer { display: flex; align-items: center; justify-content: space-between; gap: 14px; padding: 12px 16px; border-top: 1px solid #ffffff1f; background: #0000001a; color: #ffffff9e; font-size: .5625rem; font-weight: 700; line-height: 1.3; letter-spacing: .08em; text-transform: uppercase; }
  .secret-footer>span { display: flex; align-items: center; gap: 6px; }
  .secret-footer svg { width: 15px; height: 15px; color: var(--secret-paper); }
  .secret-footer strong { padding: 5px 7px; border: 1px solid #ffffff2b; border-radius: 2px; color: var(--secret-paper); font-size: .5rem; letter-spacing: .12em; white-space: nowrap; }
  @keyframes completion-line { from { opacity: 0; transform: scaleX(0); } to { opacity: .65; transform: scaleX(1); } }
  @keyframes completion-spark { from { opacity: 0; transform: scale(.45) rotate(-18deg); } to { opacity: 1; transform: scale(1) rotate(0); } }
  @keyframes completion-unlock { from { opacity: 0; transform: translateX(-8px) scale(.78); } to { opacity: 1; transform: translateX(0) scale(1); } }
  @keyframes completion-copy { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }

  @media (max-width: 360px) {
    .completion-passage { grid-template-columns: 4.5rem minmax(2.25rem, 1fr) 4.5rem; gap: 8px; }
    .completion-ring { width: 4.5rem; }
    .completion-ring-value strong { font-size: 1.35rem; }
    .completion-bonus { width: 4.5rem; }
    .completion-bonus strong { font-size: 1.9rem; }
    .completion-bridge { grid-template-columns: 1fr 19px 1fr; gap: 3px; }
    .completion-bridge svg { width: 19px; height: 19px; }
    .completion-celebration h1 { font-size: 2.45rem; }
    .streak-card { padding: 15px 13px; }
    .streak-summary { gap: 11px; }
    .streak-flame { flex-basis: 43px; width: 43px; height: 43px; }
    .streak-history { gap: 3px; }
    .streak-history i { width: 22px; height: 22px; }
    .xp-ledger { padding: 16px 14px 14px; }
    .xp-breakdown>div { padding: 0 7px; }
    .xp-breakdown dt { font-size: .625rem; }
    .xp-heading>strong { font-size: 1.75rem; }
    .perfect-badge { grid-template-columns: 54px minmax(0, 1fr); gap: 12px; padding: 15px 13px; }
    .perfect-seal { width: 54px; height: 62px; }
    .perfect-meta { grid-column: 2; flex-direction: row; align-items: center; padding: 8px 0 0; border-left: 0; border-top: 1px solid color-mix(in srgb, var(--publication-brand) 15%, transparent); }
    .secret-heading { grid-template-columns: 32px minmax(0, 1fr) auto; gap: 9px; padding: 13px; }
    .secret-lock { width: 32px; height: 32px; }
    .secret-heading>div>span { font-size: .625rem; }
    .secret-divider { padding-left: 13px; padding-right: 13px; }
    .secret-copy { padding: 13px 16px 20px; }
    .secret-copy h2 { font-size: 1.45rem; }
    .secret-footer { padding: 11px 13px; }
  }
  @media (prefers-reduced-motion: reduce) {
    .completion-ring-fill { transition: none; }
    .completion-bridge span, .completion-bridge svg, .completion-bonus, .completion-celebration h1, .completion-celebration>p { animation: none; }
  }
</style>
