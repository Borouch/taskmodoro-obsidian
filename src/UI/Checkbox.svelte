<script lang="ts">
  import { checkMark } from '../Graphics';
  import type { TaskDetails } from '../TaskDetails';

  export let td: TaskDetails;
  export let disabled = false;
  import TaskCompletionSound from '../../resources/sfx/task-completed.mp3';
  import { playMp3 } from '../Helpers/Helpers';
  import { statusCtxMenuAbsPos } from './../Stores/StatusContextMenu';

  function toggle() {
    if (!disabled) {
      if (!td.completed) {
        playMp3(TaskCompletionSound);
      }
      td.completed = !td.completed;
      if (td.file) {
        td.plugin.taskCache.toggleChecked(td);
      }
    }
  }
  const onContextMenu = (event: MouseEvent) => {
    $statusCtxMenuAbsPos = { x: event.clientX, y: event.clientY };

    console.log({ $statusCtxMenuAbsPos });
  };
</script>

<div
  class="checkbox-circle {disabled ? 'checkbox--disabled' : ''}"
  on:click={toggle}
  on:contextmenu={onContextMenu}
>
  {#if td.completed}
    <div class="check-mark-wrapper">
      {@html checkMark}
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

  :global(.query-tasks-list .check-mark-icon, .timer-task-container
      .check-mark-icon) {
    width: 10px;
    height: auto;
    stroke-width: 10%;
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
