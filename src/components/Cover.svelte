<script lang="ts">
  import { currentPub, demo, start } from '../demo.svelte';
  import Icon from './Icon.svelte';
  import ResponsiveImage from './ResponsiveImage.svelte';
  let pub = $derived(currentPub());
</script>

<ResponsiveImage class="cover-image" image="R0000086" alt="Edition cover photograph" priority="high" />
<div class="image-shade"></div>
<div class="cover-top cover-date"><span>WED, 16 SEP 2026</span></div>
<div class="cover-content">
  <div class="eyebrow" style:color={pub.accent}>THE BIG STORY <span>01 — 08</span></div>
  <h1>The city<br />is yours.<br /><em style:color={pub.accent}>Take it back.</em></h1>
  <p>Less traffic. More living.<br />A new idea for the streets we share.</p>
  <div class="cover-bottom">
    <div class="edition-info"><span class="mini-bars" style:color={pub.accent}>▥</span><span>8 stories. One daily edition.</span><span>~ 5 MIN</span></div>
    <button class="primary" onclick={start} style:background={pub.accent}>{demo.data.paid ? 'Swipe down to continue' : 'Read today'} <Icon /></button>
    <div class="payment-note">Read the opening free. Full articles are 20p each. <span>Powered by <a href="https://axate.com" target="_blank" rel="noopener noreferrer"><b>axate</b></a></span></div>
  </div>
</div>
