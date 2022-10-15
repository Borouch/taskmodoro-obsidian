<script lang="ts">
  // import { TaskStatus } from './../Enums/TaskStatus.ts';
  import type TQPlugin from '../main';
  import TaskTile from './TaskTile/TaskTile.svelte';
  import { TaskListTileParent } from '../Enums/component-context';
  import { TaskDetails } from '../TaskDetails';
  import type { Query } from '../Query';
  import { onDestroy } from 'svelte';
  import type { TaskGroup } from '../Query/TaskGroup';
  // import {
  //   statusCtxMenuAbsPos,
  //   ctxMenuTd,
  // } from './../Stores/StatusContextMenu';
  // import { checkMark, close } from '../Graphics';
  // import MenuItem from './MenuItem.svelte';
  import TaskStatusMenu from './TaskStatusMenu.svelte';
  export let plugin: TQPlugin;
  export let query: Query;
  let queryTaskListEl: HTMLElement;

  const getHeading = (level: number, name: string) => {
    level = level + 4;
    level = level > 6 ? 6 : level;
    return `<h${level}>${name}</h${level}>`;
  };

  // let statusCtxMenuRelPos: { x: Number; y: Number };
  // let showCtxMenu = false;

  let taskGroups: TaskGroup[] = [];

  // As task is modified, this codeblock will rerun at least four times
  // Modifying task will trigger at least two events - changed and resolved
  // Each event will trigger this codeblock at least two times because
  // In tasksCache store we trigger reactivity first by assigning new value to key
  // And then by returning that modified object in update callback, hence two times.

  const unsubscribeTasksCache = plugin.taskCache.tasks.subscribe(
    (tasksCache) => {
      const tasks = Object.keys(tasksCache).map((key) => tasksCache[key]);
      taskGroups = query.applyQueryToTasks(tasks).groups;
    },
  );

  // ctxMenuTd.subscribe((_td: TaskDetails) => {
  //   // showCtxMenu = false
  // });

  onDestroy(() => {
    unsubscribeTasksCache();
  });
</script>

<div class="taskmodoro">
  <div bind:this={queryTaskListEl} class="query-tasks-list">
    {#each taskGroups as taskGroup (taskGroup)}
      {#each taskGroup.groupHeadings as groupHeading}
        {@html getHeading(groupHeading.nestingLevel, groupHeading.name)}
      {/each}
      {#each taskGroup.tasks as task (task.file.path)}
        <TaskTile
          td={new TaskDetails(plugin, task)}
          parentComponent={TaskListTileParent.TasksList}
        />
      {/each}
    {/each}

    <TaskStatusMenu relativeEl={queryTaskListEl} />
  </div>
</div>

<style>
  .query-tasks-list {
    position: relative;
  }
  :global(.main-task-panel) {
    position: relative;
  }
</style>
