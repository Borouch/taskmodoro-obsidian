<script lang="ts">
  import { chevronDown } from '../../Graphics';

  export let showExpansionBtn: boolean;
  export let expanded: boolean;
  const onClick = () => {
    expanded = !expanded;
  };
  if (expanded) {
  }


</script>

<div  on:click={onClick} class="chevron-wrapper">
  {#if showExpansionBtn}
    <div class="transition contracted {expanded ? 'expanded' : ''}">
      {@html chevronDown}
    </div>
  {/if}
</div>

<style>
  .transition {
    transition-duration: 0.1s;
    transition-property: transform;
  }
  .contracted {
    transform: rotate(-90deg);
  }
  .expanded {
    transform: rotate(0deg);
  }

  :global(.chevron-down-icon) {
    width: 12px;
  }

  :global(.chevron-wrapper) {
    margin-right: 8px;
    width: 12px;
  }
  :global(.timer-task-container .chevron-wrapper) {
    width: 4px;
  }
  :global(.query-tasks-list .chevron-wrapper) {
    margin-top: -6px;
  }
  :global(.subtask-section-title-wrapper .chevron-wrapper) {
    margin-top: 2px;
  }

  :global(.chevron-down-icon path) {
    opacity: 0.7;
    fill: var(--secondary-action-item);
  }
  :global(.nested-subtasks-list .chevron-wrapper) {
    margin-left: 0px;
  }
</style>
