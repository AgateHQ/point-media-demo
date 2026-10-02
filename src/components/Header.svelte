<script lang="ts">
  import { demo, currentPub, home, openSheet } from '../demo.svelte';
  import { money, initials } from '../data';
  import Icon from './Icon.svelte';
  let pub = $derived(currentPub());
</script>

<header class="site-header">
  <div class="header-title-group">
    <button class="brand-button" onclick={home} aria-label={`${pub.name} home`}>
      <span class="logo header-full-title">{pub.name}<span style:color={pub.accent}>.</span></span>
      <span class="logo header-short-title" aria-hidden="true">{initials(pub.name)}<span style:color={pub.accent}>.</span></span>
    </button>
    <button class="discover-button" onclick={() => openSheet('discover')} style={`--discover-accent:${pub.accent}`}>
      <Icon name="discover" /><span>Discover</span>
    </button>
  </div>
  <button class="wallet-button" class:wallet-spent={demo.walletChange.kind === 'spent'} class:wallet-received={demo.walletChange.kind === 'received'} onclick={() => openSheet('wallet')}>
    <Icon name="wallet" /><span>{money(demo.data.balance)}</span><Icon name="axate" />
    {#if demo.walletChange.amount}<span class="wallet-delta">{demo.walletChange.amount}</span>{/if}
  </button>
</header>
