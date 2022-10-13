<script lang="ts">
  import type TQPlugin from '../main';
  import TaskTile from './TaskTile/TaskTile.svelte';
  import { TaskListTileParent } from '../Enums/component-context';
  import { TaskDetails } from '../TaskDetails';
  import type { Query } from '../Query';
  import { onDestroy } from 'svelte';
  import type { TaskGroup } from '../Query/TaskGroup';
  import { statusCtxMenuAbsPos } from './../Stores/StatusContextMenu';
  import { checkMark ,close} from '../Graphics';
  import MenuItem from './MenuItem.svelte';
  export let plugin: TQPlugin;
  export let query: Query;
  let queryTaskListEl: HTMLDivElement;

  const getHeading = (level: number, name: string) => {
    level = level + 4;
    level = level > 6 ? 6 : level;
    return `<h${level}>${name}</h${level}>`;
  };

  let statusCtxMenuRelPos: { x: Number; y: Number };
  let showCtxMenu = false;

  let taskGroups: TaskGroup[] = [];

  // As task is modified, this codeblock will rerun at least four times
  // Modifying task will trigger at least two events - changed and resolved
  // Each event will trigger this codeblock at least two times because
  // In tasksCache store we trigger reactivity first by assigning new value to key
  // And then by returning that modified object in update callback, hence two times.

  const unsubscribeTasksCache = plugin.taskCache.tasks.subscribe((tasksCache) => {
    const tasks = Object.keys(tasksCache).map((key) => tasksCache[key]);
    taskGroups = query.applyQueryToTasks(tasks).groups;
  });

  statusCtxMenuAbsPos.subscribe((absPos: { x: number; y: number } | null) => {
    console.log({ absPos });
    if (absPos && queryTaskListEl) {
      var rect = queryTaskListEl.getBoundingClientRect();
      const xRel = absPos.x - rect.left - 10;
      const yRel = absPos.y - rect.top + 15;
      statusCtxMenuRelPos = { x: xRel, y: yRel };
      showCtxMenu = true;
    } else {
      showCtxMenu = false;
    }
  });

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
    {#if showCtxMenu}
      <div
        class="menu"
        style={`top: ${statusCtxMenuRelPos.y}px; left: ${statusCtxMenuRelPos.x}px; `}
      >
        <MenuItem title="Completed">
          {@html checkMark}
        </MenuItem>

        <MenuItem title="Failed">
          {@html close}
        </MenuItem>
      </div>
    {/if}
  </div>
</div>

<style>
  .query-tasks-list {
    position: relative;
  }
  .menu {
    position: absolute;
    /* background-color: red;
    width: 50px;
    height: 50px; */
  }
</style>
