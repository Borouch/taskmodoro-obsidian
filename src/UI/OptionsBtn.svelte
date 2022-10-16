<script lang="ts">
  import type { TaskDetails } from '../TaskDetails';
  import {
    optionsCtxMenuAbsPos,
    ctxMenuTd,
    clickTargets
  } from '../Stores/ContextMenu';
  export let td: TaskDetails;
  import { options } from './../Graphics';

  let el: HTMLElement;
  const onContextMenu = (event: MouseEvent) => {

    $clickTargets = [el]
    $optionsCtxMenuAbsPos = { x: event.clientX, y: event.clientY };
    $ctxMenuTd = td;
  };
</script>

<div bind:this={el} on:click={onContextMenu} class="options-icon-wrapper">
  {@html options}
</div>

<style>
  .options-icon-wrapper {
    margin-right: 36px;
  }

  :global(.options-icon) {
    width: 24px;
    height: auto;
  }

  :global(.options-icon circle) {
    stroke: var(--secondary-action-item);
  }
</style>
