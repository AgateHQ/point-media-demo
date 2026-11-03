<script lang="ts">
  import { onMount } from 'svelte';
  import { demo, currentPub, isPartnerMoment, canInstall, isIos, install, notify, move, registerModelTools, type BeforeInstallPromptEvent } from './demo.svelte';
  import { readerContext } from './data';
  import { readerGestures } from './gestures';
  import { resetReaderScroll } from './editionNavigation';
  import Header from './components/Header.svelte';
  import Reader from './components/Reader.svelte';
  import Complete from './components/Complete.svelte';
  import EditionJourney from './components/EditionJourney.svelte';
  import Toast from './components/Toast.svelte';
  import Icon from './components/Icon.svelte';
  import PreviewTools from './components/PreviewTools.svelte';

  let pub = $derived(currentPub());
  let paper = $derived(pub.ink !== '#ffffff');
  let navigationKey = $derived(`${pub.id}:${demo.data.screen}:${demo.data.position}`);
  let Sheets = $state.raw<typeof import('./components/Sheets.svelte').default | null>(null);
  let sheetsLoading: Promise<void> | undefined;
  $effect(() => {
    const kind = demo.sheet;
    document.dispatchEvent(new Event('demo-sheet-change'));
    if (kind && !Sheets && !sheetsLoading) {
      sheetsLoading = import('./components/Sheets.svelte').then(module => { Sheets = module.default; }).catch(() => {
        sheetsLoading = undefined;
        demo.sheet = null;
        notify('Couldn’t load the menu. Please try again.');
      });
    }
  });
  function keydown(event: KeyboardEvent) {
    if (demo.sheet || event.defaultPrevented || demo.data.screen !== 'reader'
      || (event.target instanceof Element && event.target.closest('input,textarea,select,video,[contenteditable]'))) return;
    if (event.key === 'ArrowRight') { event.preventDefault(); move(1); }
    if (event.key === 'ArrowLeft') { event.preventDefault(); move(-1); }
  }
  onMount(() => {
    resetReaderScroll();
    const beforeInstall = (event: Event) => { event.preventDefault(); demo.installPrompt = event as BeforeInstallPromptEvent; };
    const installed = () => { demo.installPrompt = null; demo.installed = true; notify('Installed. You can launch the demo from your Home Screen.'); };
    const registerWorker = () => {
      if (!readerContext.preview && 'serviceWorker' in navigator && import.meta.env.PROD) navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`).then(registration => registration.update()).catch(() => {});
    };
    window.addEventListener('beforeinstallprompt', beforeInstall);
    window.addEventListener('appinstalled', installed);
    if (document.readyState === 'complete') registerWorker();
    else window.addEventListener('load', registerWorker, { once: true });
    const unregisterModelTools = registerModelTools();
    return () => {
      window.removeEventListener('beforeinstallprompt', beforeInstall);
      window.removeEventListener('appinstalled', installed);
      window.removeEventListener('load', registerWorker);
      unregisterModelTools();
    };
  });
</script>

<svelte:window onkeydown={keydown} />
{#if readerContext.preview}<PreviewTools />{/if}
<div class={`publication-shell publication-shell-${pub.theme || pub.id}`} class:cms-publication={!!pub.theme} class:article-layout={demo.data.screen === 'reader' && !isPartnerMoment()} style={`--publication-bg:${pub.color};--publication-ink:${pub.ink};--publication-brand:${pub.brand};--publication-accent:${pub.accent};--publication-brand-ink:${pub.brandInk};--shell-canvas:${pub.canvas};--shell-header:${pub.header};--shell-ink:${pub.headerInk || '#ffffff'};--edition-bg:${pub.color};--edition-ink:${pub.ink}`} use:readerGestures>
  <Header />
  <main class="stage">
    <section class={`reader publication-${pub.theme || pub.id}`} class:paper-edition={paper} aria-label="Daily edition">
      <EditionJourney />
      {#key navigationKey}
        {#if demo.data.screen === 'complete'}<Complete />{:else}<Reader />{/if}
      {/key}
    </section>
  </main>
  {#if canInstall()}<footer class="site-footer"><button class="install-button" onclick={install}><Icon name="install" /><span>{isIos() ? 'Add to Home Screen' : 'Install app'}</span></button></footer>{/if}
</div>
{#if Sheets}<Sheets />{:else if demo.sheet}<div class="sheet-loading" role="status">Loading…</div>{/if}
<Toast />
