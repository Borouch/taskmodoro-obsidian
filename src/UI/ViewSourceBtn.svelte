<script lang="ts">
  import type { TFile } from 'obsidian';
  import type TQPlugin from '../main';
  import { externalLink } from '../Graphics';
  import { viewSource } from '../Editor/EditorHelpers';

  export let classes = '';
  export let plugin: TQPlugin;
  export let file: TFile;
  export let close: () => void;
</script>

{#if file}
  <span
    class={classes}
    on:click={() => {
      viewSource(file, plugin, close);
    }}
  >
    {@html externalLink}
  </span>
{/if}

<style>
  /* .external-link-wrapper {
    padding-right: 44px;
  } */

  :global(.external-link-icon) {
    stroke-width: 0px;
  }
  :global(.external-link-icon:hover) {
    cursor: pointer;
  }

  :global(.external-link-icon path) {
    fill: var(--secondary-action-item);
  }

  :global(.trailing-menu-item > .external-link-icon) {
    height: 24px;
    width: auto;
  }
</style>
