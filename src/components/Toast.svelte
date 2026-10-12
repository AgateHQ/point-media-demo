<script lang="ts">
  import { tick } from 'svelte';
  import { demo } from '../demo.svelte';
  let toast: HTMLDivElement;
  let left = $state('');
  let top = $state('');
  $effect(() => {
    const anchor = demo.toast.anchor;
    const message = demo.toast.message;
    if (!anchor || !message) { left = top = ''; return; }
    let active = true;
    tick().then(() => {
      if (!active) return;
      const half = toast.offsetWidth / 2;
      left = `${Math.max(half + 12, Math.min(window.innerWidth - half - 12, anchor.left + anchor.width / 2))}px`;
      top = `${Math.max(12, Math.min(anchor.bottom + 10, window.innerHeight - 70))}px`;
    });
    return () => { active = false; };
  });
</script>

<div id="toast" bind:this={toast} role="status" aria-live="polite" aria-atomic="true"
  class:visible={demo.toast.visible} class:anchored={!!demo.toast.anchor}
  class:toast-transaction={!!demo.toast.kind} class:toast-spent={demo.toast.kind === 'spent'} class:toast-received={demo.toast.kind === 'received'} style:left style:top>
  {#if demo.toast.kind}
    <span class="toast-transaction-mark" aria-hidden="true">{demo.toast.kind === 'received' ? '+' : '−'}</span>
    <span class="toast-transaction-copy"><strong>{demo.toast.amount}</strong><span>{demo.toast.message}</span></span>
  {:else}
    <span>{demo.toast.message}</span>
  {/if}
</div>
