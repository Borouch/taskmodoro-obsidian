<script lang="ts">
  import { TaskStatus } from './../Enums/TaskStatus.ts';
  import { checkMark, close } from '../Graphics';
  import type { TaskDetails } from '../TaskDetails';

  export let td: TaskDetails;
  export let disabled = false;
  import TaskCompletionSound from '../../resources/sfx/task-completed.mp3';
  import { playMp3 } from '../Helpers/Helpers';
  import {
    statusCtxMenuAbsPos,
     ctxMenuTd,
  } from './../Stores/StatusContextMenu';


  function toggle() {
    if (!disabled) {
      if (!td.hasCompletionStatus) {
        playMp3(TaskCompletionSound);
        td.status = 'done';
      } else {
        td.status = 'uncompleted';
      }
      if (td.file) {
        td.plugin.taskCache.toggleCompletionStatusChange(td.file,td.status);
      }
    }
  }

  // $: {
  //   td.status = $selectedCtxMenuStatus;
  // }

  const onContextMenu = (event: MouseEvent) => {
    $statusCtxMenuAbsPos = { x: event.clientX, y: event.clientY };
    $ctxMenuTd = td;
  };
</script>

<div
  class="checkbox-circle {disabled ? 'checkbox--disabled' : ''}"
  on:click={toggle}
  on:contextmenu={onContextMenu}
>
  {#if td.status === 'done'}
    <div class="check-mark-wrapper">
      {@html checkMark}
    </div>
  {/if}
  {#if td.status === 'failed'}
    <div class="close-wrapper">
      {@html close}
    </div>
  {/if}
</div>

<style>
  .checkbox-circle {
    border-radius: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .checkbox--disabled {
    opacity: 0.7;
    /* border-color: var(--dark-blue-gray); */
  }

  .checkbox--disabled:hover {
    cursor: default;
  }

  .check-mark-wrapper {
    margin: 2;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    align-content: center;
  }

  :global(.check-mark-icon) {
    fill: var(--status-fill);
    opacity: 0.8;
  }

  :global(.checkbox-circle .close-icon path) {
    fill: var(--status-fill);
    opacity: 0.8;
  }

  :global(.query-tasks-list .close-icon, .timer-task-container .close-icon) {
    width: 8px;
    height: auto;
    stroke-width: 10%;
  }

  :global(.query-tasks-list .check-mark-icon, .timer-task-container
      .check-mark-icon) {
    width: 10px;
    height: auto;
    stroke-width: 10%;
  }

  :global(.query-tasks-list .close-wrapper) {
    margin-top: -6px;
  }

  :global(.query-tasks-list .checkbox-circle, .timer-task-container
      .checkbox-circle) {
    width: 20px;
    height: 20px;
    border: 1.5px solid var(--checkbox-border);
  }

  :global(.main-task-panel .check-mark-icon) {
    width: 10px;
    height: auto;
    stroke-width: 7%;
  }

  :global(.main-task-panel .checkbox-circle) {
    width: 22px;
    height: 22px;
    border: 1px solid var(--checkbox-border);
  }
</style>
