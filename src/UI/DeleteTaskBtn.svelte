<script lang="ts">
  import { bin } from './../Graphics';
  import type { TaskDetails } from '../TaskDetails';
  import { DeleteTaskModal } from './../Modals';
  export let td: TaskDetails;
  const openDeleteTaskPopup = () => {
    new DeleteTaskModal(td).open();
  };
</script>

<div on:click={openDeleteTaskPopup} class="delete-icon-wrapper">
  {@html bin}
</div>

<style>
  .delete-icon-wrapper {
    display: flex;
    justify-content: flex-end;
  }
  :global(.delete-icon) {
    width: 20px;
    height: auto;
  }

  :global(.delete-icon path) {
    fill: var(--secondary-action-item);
  }
</style>
