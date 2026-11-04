<script lang="ts">
  import { demo, currentPub, getStories, home, openSheet } from '../demo.svelte';
  import { money } from '../data';
  import Icon from './Icon.svelte';
  import PublicationLogo from './PublicationLogo.svelte';
  let pub = $derived(currentPub());
</script>

<header class="site-header">
  <div class="header-title-group">
    <button class="brand-button" onclick={home} aria-label={`${pub.name} first article`}>
      <PublicationLogo publication={pub} variant="white" class="header-wordmark" decorative />
      <PublicationLogo publication={pub} variant="icon" class="header-brand-icon" decorative />
    </button>
    <button class="discover-button" disabled={!getStories().length} onclick={() => openSheet('discover')} style={`--discover-accent:${pub.accent}`}>
      <Icon name="discover" /><span>Discover</span>
    </button>
  </div>
  <span class="header-tagline">{pub.subtitle}</span>
  <button class="wallet-button" class:wallet-spent={demo.walletChange.kind === 'spent'} class:wallet-received={demo.walletChange.kind === 'received'}
    onclick={() => openSheet('wallet')} aria-label={`Open wallet. Balance ${money(demo.data.balance)}`}>
    <Icon name="wallet" />
    {#key demo.data.balance}<span class="wallet-balance">{money(demo.data.balance)}</span>{/key}
    <Icon name="axate" />
    {#if demo.walletChange.amount}
      {#key demo.walletChange.id}<span class="wallet-delta" aria-hidden="true">{demo.walletChange.amount}</span>{/key}
    {/if}
  </button>
</header>
