<script lang="ts">
  import { onMount, tick } from 'svelte';
  import { demo, currentPub, canInstall, isIos, install, notify, move, registerModelTools, type BeforeInstallPromptEvent } from './demo.svelte';
  import { readerGestures } from './gestures';
  import Header from './components/Header.svelte';
  import Reader from './components/Reader.svelte';
  import Complete from './components/Complete.svelte';
  import Toast from './components/Toast.svelte';
  import Icon from './components/Icon.svelte';

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
  $effect(() => {
    navigationKey;
    tick().then(() => {
      document.querySelector<HTMLElement>('.reader')?.scrollTo(0, 0);
      window.scrollTo(0, 0);
    });
  });
  function keydown(event: KeyboardEvent) {
    if (demo.sheet || demo.data.screen !== 'reader' || event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) return;
    if (event.key === 'ArrowRight') { event.preventDefault(); move(1); }
    if (event.key === 'ArrowLeft') { event.preventDefault(); move(-1); }
  }
  onMount(() => {
    const beforeInstall = (event: Event) => { event.preventDefault(); demo.installPrompt = event as BeforeInstallPromptEvent; };
    const installed = () => { demo.installPrompt = null; demo.installed = true; notify('Installed. You can launch the demo from your Home Screen.'); };
    const registerWorker = () => {
      if ('serviceWorker' in navigator && import.meta.env.PROD) navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`).then(registration => registration.update()).catch(() => {});
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
<div class={`publication-shell publication-shell-${pub.id}`} class:article-layout={demo.data.screen === 'reader' && demo.data.position !== 4} style={`--publication-bg:${pub.color};--publication-ink:${pub.ink};--publication-brand:${pub.brand};--publication-accent:${pub.accent};--publication-brand-ink:${pub.brandInk};--shell-canvas:${pub.canvas};--shell-header:${pub.header};--shell-ink:#ffffff;--edition-bg:${pub.color};--edition-ink:${pub.ink}`} use:readerGestures>
  <Header />
  <main class="stage">
    <section class={`reader publication-${pub.id}`} class:paper-edition={paper} aria-label="Daily edition">
      {#key navigationKey}
        {#if demo.data.screen === 'complete'}<Complete />{:else}<Reader />{/if}
      {/key}
    </section>
  </main>
  {#if canInstall()}<footer class="site-footer"><button class="install-button" onclick={install}><Icon name="install" /><span>{isIos() ? 'Add to Home Screen' : 'Install app'}</span></button></footer>{/if}
</div>
{#if Sheets}<Sheets />{:else if demo.sheet}<div class="sheet-loading" role="status">Loading…</div>{/if}
<Toast />
