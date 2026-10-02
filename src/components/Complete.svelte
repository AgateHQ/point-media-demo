<script lang="ts">
  import { demo, currentPub, start, openSheet } from '../demo.svelte';
  import Icon from './Icon.svelte';
  let pub = $derived(currentPub());
  function again() { demo.data.position = 0; start(); }
  function last() { demo.data.position = 8; start(); }
</script>

<div class="completion">
  <div class="completion-top"><button class="completion-back" onclick={last} aria-label="Back to the last article"><Icon /><span>Last article</span></button><span>08 / 08</span></div>
  <div class="complete-symbol" style:background={pub.accent}>✓</div>
  <span class="eyebrow">THAT'S YOUR EDITION.</span>
  <h1>You're<br />up to date<span style:color={pub.accent}>.</span></h1>
  <p>Eight stories. A fresh perspective.<br />The rest of the day is yours.</p>
  <div class="stats"><div><strong>8 / 8</strong><span>STORIES READ</span></div><div><strong>{demo.data.reward ? '10p' : '0p'}</strong><span>REWARDS EARNED</span></div></div>
  <button class="primary" onclick={again} style:background={pub.accent}>Read again <Icon /></button>
  <button class="completion-network-cue" onclick={() => openSheet('network')} style={`--completion-accent:${pub.accent}`}><span><Icon /></span><strong>Swipe up to see the rest of the network</strong></button>
</div>
