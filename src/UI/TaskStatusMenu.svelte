<script lang="ts">
  import type { TaskStatus } from '../FileInterface';
  import MenuItem from './MenuItem.svelte';
  import { checkMark, close } from '../Graphics';
  import { statusCtxMenuAbsPos, ctxMenuTd } from '../Stores/StatusContextMenu';
  import { onMount } from 'svelte';
  import { isClickOutsideTargets } from '../Helpers/Helpers';

  export let relativeEl: HTMLElement;
  let showTaskCtxMenu: boolean;
  let statusCtxMenuRelPos: { x: Number; y: Number };
  let taskStatusMenuEl: HTMLElement;
  onMount(() => {});

  $: {
    handleClickOutside(showTaskCtxMenu);
  }

  const handleClickOutside = (_showTaskCtxMenu: boolean) => {
    if (_showTaskCtxMenu) {
      document.addEventListener('click', closeIfClickOutsideCallback);
    } else {
      document.removeEventListener('click', closeIfClickOutsideCallback);
    }
  };

  const closeIfClickOutsideCallback = (e: Event) => {
    const isClickOutside = isClickOutsideTargets(e, [taskStatusMenuEl]);
    showTaskCtxMenu = !isClickOutside;
  };

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

  statusCtxMenuAbsPos.subscribe((absPos: { x: number; y: number } | null) => {
    console.log({ absPos });
    if (absPos && relativeEl) {
      var rect = relativeEl.getBoundingClientRect();
      const xRel = absPos.x - rect.left - 10;
      const yRel = absPos.y - rect.top + 15;
      statusCtxMenuRelPos = { x: xRel, y: yRel };
      // statusCtxMenuRelPos = { x: xRel, y: yRel };
      showTaskCtxMenu = true;
    } else {
      showTaskCtxMenu = false;
    }
  });
</script>

{#if showTaskCtxMenu}
  <div
    bind:this={taskStatusMenuEl}
    class="task-status-menu menu"
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
