<script lang="ts">
  import TaskDetailsMainPanel from './TaskDetailsMainPanel.svelte';
  import TaskDetailsSidebar from './TaskDetailsSidebar.svelte';
  import type TQPlugin from '../../main';
  import type { FilePath, Task } from '../../FileInterface';
  import { TaskDetails } from '../../TaskDetails';
  import type { Writable } from 'svelte/store';
  import { TaskDetailsMode } from '../../Enums/component-context';

  export let close: () => void;
  export let mode: TaskDetailsMode;
  export let plugin: TQPlugin;
  let td: TaskDetails;
  let tasksCache: Writable<Record<string, Task>> = plugin.taskCache.tasks;
  let tasksNav: Writable<FilePath[]> = plugin.taskNav.tasksNavigation;

  $: {
    getTd($tasksCache, $tasksNav);
  }

  // Either gets last navigation task or a new one is created
  const getTd = (tasks: Record<string, Task>, tasksNav: FilePath[]) => {
    let currTask: FilePath|undefined = tasksNav.last();

    if (currTask) {
      td = new TaskDetails(plugin, tasks[currTask],close);
    } else {
      td = new TaskDetails(plugin,undefined,close);
    }
  };

</script>

{#if mode === TaskDetailsMode.Create}
  <TaskDetailsMainPanel {mode} bind:td />
  <TaskDetailsSidebar {mode} bind:td />
  <!-- Changes in update mode are made by modifying file contents
    which trigger a change in svelte store that rerenders dependant UI -->
{:else if mode === TaskDetailsMode.Update}
  <TaskDetailsMainPanel {mode} {td} />
  <TaskDetailsSidebar {mode} {td} />
{/if}

<style>
</style>
