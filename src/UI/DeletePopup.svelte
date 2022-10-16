<script lang="ts">
  import type { TaskDetails } from '../TaskDetails';
  export let td: TaskDetails;
  import { deletePopupCloseCallback } from './../Stores/DeletePopup';
  export let close: () => void;
  let deletedSubtasks = false;
  const deleteTd = () => {
    if (deletedSubtasks) {
      deleteRecursively(td);
    } else {
      td.plugin.app.vault.delete(td.file!);
    }
    $deletePopupCloseCallback=close

  };

  const deleteRecursively = (td: TaskDetails) => {
    // if (td.subtasks.length === 0) {
    //   td.plugin.app.vault.delete(td.file!);
    // } else {
      for (const subtask of td.subtasks) {
        deleteRecursively(subtask);
      }
      td.plugin.app.vault.delete(td.file!);
    // }
  };
</script>

<div class="delete-popup-container">
  <input bind:checked={deletedSubtasks} type="checkbox" />
  <span>Delete subtask recursively</span>
  <div class="actions-container">
    <button on:click={() => close()}>Cancel</button>
    <button on:click={deleteTd} class="mod-cta">Delete</button>
  </div>
</div>

<style>
  input {
    margin-right: 1rem;
  }
  .actions-container {
    margin-top: 3rem;
    display: flex;
    justify-content: center;
    gap: 1rem;
  }
  .delete-popup-container {
    padding: 2rem;
    padding-bottom: 0;
    /* display: flex;
    flex-direction: row; */
  }

  :global(.delete-popup-title) {
    display: flex;
    justify-content: center;
    font-size: 1.4rem;
  }
</style>
