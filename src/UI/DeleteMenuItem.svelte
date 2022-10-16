<script lang="ts">
  import { bin } from './../Graphics';
  import type { TaskDetails } from '../TaskDetails';
  import { DeleteTaskModal } from './../Modals';
  import MenuItem from './MenuItem.svelte';
  export let td: TaskDetails;
  const openDeleteTaskPopup = () => {
    new DeleteTaskModal(td).open();
  };
</script>

<MenuItem on:click={openDeleteTaskPopup} title="Delete">
  <div  class="delete-icon-wrapper">
    {@html bin}
  </div>
</MenuItem>

<style>
  :global(.menu-item-icon .delete-icon) {
    width: 16px;
    height: auto;
  }

  :global(.menu-item-icon .delete-icon path) {
    fill: var(--text-faint);
  }
</style>
