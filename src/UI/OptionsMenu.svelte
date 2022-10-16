<script lang="ts">
  import ContextMenu from './ContextMenu.svelte';
  import { optionsCtxMenuAbsPos, ctxMenuTd } from './../Stores/ContextMenu';

  import DeleteMenuItem from './DeleteMenuItem.svelte';
  export let relativeEl: HTMLElement;
  let showCtxMenu = false;
</script>

<ContextMenu
  alignX="left"
  {relativeEl}
  ctxMenuAbsPosStore={optionsCtxMenuAbsPos}
  {showCtxMenu}
>
  <DeleteMenuItem td={$ctxMenuTd} />
</ContextMenu>

<style>
</style>
