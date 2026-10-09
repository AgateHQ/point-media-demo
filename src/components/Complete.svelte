<script lang="ts">
  import { demo, currentPub, getStories, pubCollected, home, openStory, openSheet, selectPublication } from '../demo.svelte';
  import { publications, stories, nextPublicationId } from '../data';
  import Icon from './Icon.svelte';
  let pub = $derived(currentPub());
  let nextPub = $derived(publications.find(item => item.id === nextPublicationId(pub.id))!);
  let preview = $derived(stories[nextPub.storyOrder[3]]);
  let streak = $derived(Math.max(3, Object.keys(demo.data.visited).filter(id => (demo.data.visited[id] || []).length === 8).length + 2));
  let collectedCount = $derived(getStories().filter(story => pubCollected().includes(story.id)).length);
  function again() { home(); }
  function last() { openStory(getStories()[7].id); }
  function nextEdition() { selectPublication(pub.id === 'pitchline' ? 'the-scoop' : ['the-scoop','brightwire','full-time','evening-lantern','northgate-ledger','pitchline'][(['the-scoop','brightwire','full-time','evening-lantern','northgate-ledger','pitchline'].indexOf(pub.id) + 1) % 6]); }
</script>

<div class="completion">
  <div class="completion-top"><button class="completion-back" onclick={last} aria-label="Back to the last article"><Icon /><span>Last article</span></button></div>
  <div class="completion-hero">
    <div class="complete-symbol" style:background={pub.accent}>✓</div>
    <div class="level-badge"><span>LEVEL</span><strong>09</strong></div>
  </div>
  <span class="eyebrow">EDITION COMPLETE <span>{pub.name.toUpperCase()}</span></span>
  <h1>You've done<br />with this edition<span style:color={pub.accent}>.</span></h1>
  <p>Eight stories, all read. You’ve unlocked the ninth: a secret preview of what’s coming next.</p>
  <div class="stats"><div><strong>8</strong><span>ARTICLES READ</span></div><div><strong>{streak} days</strong><span>READING STREAK</span></div><div><strong>{demo.data.reward ? '10p' : '0p'}</strong><span>REWARDS EARNED</span></div></div>
  <div class="achievement-row"><span class="achievement-icon">✦</span><div><strong>Perfect edition</strong><small>Read every story in {pub.name}</small></div><span class="achievement-check">✓</span></div>
  <article class="completion-preview">
    <div class="completion-preview-label"><span>JUST FOR YOU</span><span>SECRET PREVIEW</span></div>
    <small>{nextPub.name.toUpperCase()} · NEXT EDITION</small>
    <h2>{preview.title.replace(/\n/g, ' ')}</h2>
    <p>{preview.subtitle}</p>
  </article>
  <button class="primary" onclick={nextEdition} style:background={pub.accent}>Explore another edition <Icon /></button>
  <button class="completion-secondary" onclick={() => openSheet('collection')}>Your daily set · {collectedCount} / {getStories().length} collected</button>
  <button class="completion-secondary" onclick={again}>Read this edition again</button>
  <button class="completion-network-cue" onclick={() => openSheet('network')} style={`--completion-accent:${pub.accent}`}><span><Icon /></span><strong>Swipe up to see the rest of the network</strong></button>
</div>
