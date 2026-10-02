<script lang="ts">
  import { demo, currentPub, home, openSheet } from '../demo.svelte';
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
    <button class="discover-button" onclick={() => openSheet('discover')} style={`--discover-accent:${pub.accent}`}>
      <Icon name="discover" /><span>Discover</span>
    </button>
  </div>
  <span class="header-tagline">{pub.subtitle}</span>
  <button class="wallet-button" class:wallet-spent={demo.walletChange.kind === 'spent'} class:wallet-received={demo.walletChange.kind === 'received'} onclick={() => openSheet('wallet')}>
    <Icon name="wallet" /><span>{money(demo.data.balance)}</span><Icon name="axate" />
    {#if demo.walletChange.amount}<span class="wallet-delta">{demo.walletChange.amount}</span>{/if}
  </button>
</header>
