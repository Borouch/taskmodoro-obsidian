<script lang="ts">
  import type { TaskStatus } from '../FileInterface';
  import MenuItem from './MenuItem.svelte';
  import { checkMark, close } from '../Graphics';
  import {
    statusCtxMenuAbsPos,
    ctxMenuTd,
  } from '../Stores/StatusContextMenu';

  export let relativeEl: HTMLElement;
  let statusCtxMenuRelPos: { x: Number; y: Number };
  let showCtxMenu = false;

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
    showCtxMenu = false;
  };

  statusCtxMenuAbsPos.subscribe((absPos: { x: number; y: number } | null) => {
    console.log({ absPos });
    if (absPos && relativeEl) {
      var rect = relativeEl.getBoundingClientRect();
      const xRel = absPos.x - rect.left - 10;
      const yRel = absPos.y - rect.top + 15;
      statusCtxMenuRelPos = { x: xRel, y: yRel };
      // statusCtxMenuRelPos = { x: xRel, y: yRel };
      showCtxMenu = true;
    } else {
      showCtxMenu = false;
    }
  });
</script>

{#if showCtxMenu}
  <div
    class="menu"
    style={`top: ${statusCtxMenuRelPos.y}px; left: ${statusCtxMenuRelPos.x}px; `}
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
  </div>
{/if}

<style>
  .menu {
    z-index: 5;
    position: absolute;
  }
</style>
