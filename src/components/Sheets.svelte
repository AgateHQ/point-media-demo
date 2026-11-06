<script lang="ts">
  import { onMount } from 'svelte';
  import { demo, currentPub, unlockedEditionCount, openStory, selectPublication, topup, reset, isIos, isSafari, notify, partnerMomentEnabled } from '../demo.svelte';
  import { publications, money } from '../data';
  import type { DiscoverArticle } from '../discover';
  import { motionDelay, reducedMotionPreference } from '../motion';
  import Icon from './Icon.svelte';
  import PublicationLogo from './PublicationLogo.svelte';
  import EditionCollection from './EditionCollection.svelte';
  let pub = $derived(currentPub());
  let Discover = $state.raw<typeof import('./Discover.svelte').default | null>(null);
  let discoverLoading: Promise<void> | undefined;
  let sheet: HTMLDialogElement;
  let closing = $state(false);
  let entering = $state(false);
  let slideToEdition = $state(false);
  let timer = 0;
  let unlockedCount = $derived(unlockedEditionCount());
  let label = $derived(demo.sheet === 'discover' ? 'Discover articles' : demo.sheet === 'network' ? 'Choose a publication' : demo.sheet === 'collection' ? 'Your daily story collection' : demo.sheet === 'install' ? 'Install app instructions' : demo.sheet === 'wallet' ? 'Axate wallet' : 'Network title preview');

  $effect(() => {
    if (demo.sheet === 'discover' && !Discover && !discoverLoading) {
      discoverLoading = import('./Discover.svelte').then(module => { Discover = module.default; }).catch(() => {
        discoverLoading = undefined;
        demo.sheet = null;
        notify('Couldn’t load Discover. Please try again.');
      });
    }
  });

  $effect(() => {
    if (demo.sheet) { if (!sheet.open) sheet.showModal(); }
    else {
      sheet.close();
      closing = entering = slideToEdition = false;
      window.clearTimeout(timer);
    }
    document.dispatchEvent(new Event('demo-sheet-change'));
  });

  onMount(() => {
    const motion = reducedMotionPreference();
    const finishWithoutMotion = () => {
      if (!motion.matches || (!closing && !entering)) return;
      window.clearTimeout(timer);
      timer = 0;
      demo.sheet = null;
    };
    motion.addEventListener('change', finishWithoutMotion);
    return () => motion.removeEventListener('change', finishWithoutMotion);
  });

  function close() {
    if (closing || entering) return;
    const delay = motionDelay(650);
    if (!delay) { demo.sheet = null; return; }
    closing = true;
    timer = window.setTimeout(() => { demo.sheet = null; }, delay);
  }
  function enter(article: DiscoverArticle, motion: 'down' | 'up') {
    if (entering || closing) return;
    if (article.href) {
      demo.sheet = null;
      window.location.assign(article.href);
      return;
    }
    const delay = motionDelay(motion === 'up' ? 620 : 320);
    entering = delay > 0;
    slideToEdition = delay > 0 && motion === 'up';
    openStory(article.story.id, article.publication.id, !delay);
    if (delay) timer = window.setTimeout(() => { demo.sheet = null; }, delay);
  }
  function events(node: HTMLDialogElement) {
    const click = (e: MouseEvent) => {
      if (e.target !== node) return;
      const r = node.getBoundingClientRect();
      if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) close();
    };
    const cancel = (e: Event) => { e.preventDefault(); close(); };
    const animationEnd = (e: AnimationEvent) => { if (e.target === node && closing) demo.sheet = null; };
    const closed = () => { if (demo.sheet && !node.open) demo.sheet = null; };
    node.addEventListener('click', click); node.addEventListener('cancel', cancel);
    node.addEventListener('animationend', animationEnd); node.addEventListener('close', closed);
    return { destroy() {
      window.clearTimeout(timer);
      node.removeEventListener('click', click); node.removeEventListener('cancel', cancel);
      node.removeEventListener('animationend', animationEnd); node.removeEventListener('close', closed);
    } };
  }
</script>

<dialog id="sheet" bind:this={sheet} use:events class={demo.sheet ? `${demo.sheet}-sheet` : ''} class:closing class:slide-to-edition={slideToEdition} aria-label={label}
  style={demo.sheet === 'collection' ? `--edition-bg:${pub.color};--edition-ink:${pub.ink};--publication-brand:${pub.brand}` : undefined}>
  {#if demo.sheet === 'discover'}
    {#if Discover}<Discover onclose={close} onenter={enter} />{:else}<div class="discover-chrome"><span role="status">Loading…</span><button class="close" onclick={close} aria-label="Close discover">×</button></div>{/if}
  {:else if demo.sheet}
    <div class="sheet-handle"></div><button class="close" onclick={close} aria-label="Close dialog">×</button>
    {#if demo.sheet === 'collection'}
      <EditionCollection />
    {:else if demo.sheet === 'network'}
      <span class="eyebrow">THE AXATE NETWORK</span><h2>Choose your<br />next read.</h2><p>Your wallet and reading progress travel with you.</p>
      <div class="network-sheet-publications">
        {#each publications as p (p.id)}
          <button class="network-sheet-publication" onclick={() => selectPublication(p.id)}>
            <span class="pub-avatar-circle" class:current={p.id === demo.data.publication} style={`border-color:${p.brand};background:#ffffff`}><PublicationLogo publication={p} variant="icon" decorative /></span>
            <span class="network-sheet-copy"><strong>{p.name}</strong><small>{p.subtitle}</small></span><Icon />
          </button>
        {/each}
      </div>
    {:else if demo.sheet === 'install'}
      <span class="eyebrow">PHONE DEMO</span><h2>Add it to your<br />Home Screen.</h2>
      <p>{isIos() ? (isSafari() ? 'In Safari, use the Share button to add this demo to your Home Screen.' : 'For the smoothest install, open this page in Safari first.') : 'Use the browser install prompt or menu to add the demo as an app.'}</p>
      <div class="install-steps">
        <span>1</span><p>{isIos() && !isSafari() ? 'Open this URL in Safari.' : 'Keep this page open in your browser.'}</p>
        <span>2</span><p>{#if isIos()}Tap Share <Icon name="share" /> in Safari.{:else}Open the browser menu and tap Install app.{/if}</p>
        <span>3</span><p>{isIos() ? 'Scroll down and choose Add to Home Screen, then tap Add.' : 'Confirm the install, then open Axate Demo from your Home Screen.'}</p>
      </div>
      <p class="install-result">It launches full screen and keeps your demo progress on this device.</p><button class="primary" onclick={close}>Got it <Icon /></button>
    {:else}
      <span class="eyebrow">YOUR AXATE WALLET</span><p>Your funds travel with you across the Axate network.</p>
      <div class="balance-row"><span>Balance</span>{#key demo.data.balance}<strong class:balance-bump={!!demo.walletChange.kind} class:balance-spent={demo.walletChange.kind === 'spent'}>{money(demo.data.balance)}</strong>{/key}<button class="wallet-top-up" onclick={topup} aria-label="Top up 1 GBP">Top up £1</button></div>
      <div class="wallet-sheet-event" class:wallet-sheet-event-visible={!!demo.walletChange.amount} class:wallet-sheet-event-spent={demo.walletChange.kind === 'spent'} aria-hidden="true">
        {#if demo.walletChange.amount}{#key demo.walletChange.id}<strong>{demo.walletChange.amount}</strong><span>{demo.walletChange.label}</span>{/key}{/if}
      </div>
      <div class="price-row"><span>Full editions</span><span>{unlockedCount} unlocked · {money(demo.data.unlockSpend)} paid</span></div>
      {#if partnerMomentEnabled || demo.data.reward}
        <div class="price-row"><span>Partner reward</span><span>{demo.data.reward ? '+10p received' : 'Available in this edition'}</span></div>
      {/if}
      <p class="fine-print">Powered by <a href="https://axate.com" target="_blank" rel="noopener noreferrer"><b>axate</b></a></p><button class="wallet-reset" onclick={reset}>Reset everything</button>
    {/if}
  {/if}
</dialog>
