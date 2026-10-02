<script lang="ts">
  import { arrow, walletIcon, discoverIcon, axateIcon, installIcon, shareIcon } from '../icons';
  const icons = { arrow, wallet: walletIcon, discover: discoverIcon, axate: axateIcon, install: installIcon, share: shareIcon };
  let { name = 'arrow' }: { name?: keyof typeof icons } = $props();
</script>

{@html icons[name]}
