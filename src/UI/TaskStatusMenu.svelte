<script lang="ts">
  import type { TaskStatus } from '../FileInterface';
  import MenuItem from './MenuItem.svelte';
  import { checkMark, close } from '../Graphics';
  import { statusCtxMenuAbsPos, ctxMenuTd } from '../Stores/ContextMenu';
  import ContextMenu from './ContextMenu.svelte';

  export let relativeEl: HTMLElement;
  let showTaskCtxMenu: boolean = false;

  const setStatus = (status: TaskStatus) => {
    if ($ctxMenuTd.file) {
      if ($ctxMenuTd.status === 'uncompleted' || status === 'uncompleted') {
        $ctxMenuTd.plugin.taskCache.toggleCompletionStatusChange(
          $ctxMenuTd.file,
          status,
        );
      } else {
        $ctxMenuTd.plugin.fileInterface.changeCompletedStatus(
          $ctxMenuTd.file,
          status,
        );
      }
    }
    $ctxMenuTd.status = status;
    showTaskCtxMenu = false;
  };
</script>

<ContextMenu
  {relativeEl}
  ctxMenuAbsPosStore={statusCtxMenuAbsPos}
  bind:showCtxMenu={showTaskCtxMenu}
>
  <MenuItem
    on:click={() => {
      setStatus('done');
    }}
    title="Done"
  >
    {@html checkMark}
  </MenuItem>

  <MenuItem
    on:click={() => {
      setStatus('failed');
    }}
    title="Failed"
  >
    {@html close}
  </MenuItem>
</ContextMenu>

<style>
</style>
