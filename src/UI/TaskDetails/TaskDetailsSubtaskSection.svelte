<script lang="ts">
  import { TaskDetails } from '../../TaskDetails';
  import { TaskDetailsMode } from '../../Enums/component-context';
  import TaskTile from '../TaskTile/TaskTile.svelte';
  import { TaskListTileParent as TaskTileParent } from '../../Enums/component-context';
  import type { TFile } from 'obsidian';
  import SubtasksExpansionBtn from '../TaskTile/SubtasksExpansionBtn.svelte';
  import Editor from '../Editor.svelte';
  import { allowOpenInternalLinks } from '../../Editor/InternalLink';
  import { renderMarkdown } from '../../Editor/RenderMarkdown';
  import { afterUpdate } from 'svelte';
  export let td: TaskDetails;
  export let mode: TaskDetailsMode;

  let subtaskName: string = '';
  let subtaskDisplayEl: HTMLElement;
  let isEditMode = false;
  let showExpansionBtn = true;
  let expanded = true;

  afterUpdate(() => {
    if (!isEditMode) {
      renderMD(subtaskDisplayEl, subtaskName);
    }
  });

  const addSubtask = () => {
    if (subtaskName.match(/[\w\d]/g)) {
      let subtask = new TaskDetails(td.plugin);
      subtaskName = subtaskName.replace(/(\n)+/g, '');
      subtask.taskName = subtaskName;
      subtaskName = '';
      td.subtasks.push(subtask);
      td = td;
      if (mode === TaskDetailsMode.Update) {
        storeSubtask(subtask);
      }
    }
  };

  const storeSubtask = (subtask: TaskDetails) => {
    subtask.create().then((fileName) => {
      const tasksDir = td.plugin.fileInterface.tasksDir;
      const path = `${tasksDir}/${fileName}`;
      const file = td.plugin.app.metadataCache.getFirstLinkpathDest(path, '/');
      if (file) {
        subtask.file = file;
        updateParentChildTaskFm(file);
      }
    });
  };

  const updateParentChildTaskFm = (subtaskFile: TFile) => {
    td.plugin.fileInterface.updateFMProp(
      subtaskFile,
      td.file!.name,
      'parents',
      true,
    );

    td.plugin.fileInterface.updateFMProp(
      td.file!,
      subtaskFile.name,
      'subtasks',
      true,
    );
  };

  const renderMD = (el: HTMLElement, MD: string) => {
    if (!el) {
      return;
    }

    const path = td.file ? td.file.path : '/';
    renderMarkdown(td.plugin, path, MD).then((temp) => {
      el.innerHTML = temp.innerHTML;
      allowOpenInternalLinks(el, td.plugin, td.close!);
    });
  };
</script>

<div class="subtask-section">
  <div class="subtask-section-title-wrapper">
    <SubtasksExpansionBtn {showExpansionBtn} bind:expanded />
    <span class="subtask-section-title">Subtasks</span>
  </div>
  {#if expanded}
    <div class="subtask-section-body">
      <div class="subtask-input-wrapper">
        <Editor
          bind:displayEl={subtaskDisplayEl}
          bind:text={subtaskName}
          onClick={() => {
            isEditMode = true;
          }}
          onEnter={() => {
            isEditMode = false
            addSubtask();
          }}
          onFocusout={() => {
            isEditMode = false;
          }}
          placeholder="Add a subtask"
          showEditor={isEditMode}
          displayContainerId="subtask-input__name"
        />
      </div>
      <div class="subtasks-list">
        {#each td.subtasks as subtask (subtask.taskName)}
          <TaskTile
            {mode}
            parentComponent={TaskTileParent.TaskDetailsMainPanel}
            bind:td={subtask}
          />
        {/each}
      </div>
    </div>
  {/if}
</div>

<style>
  .subtask-section {
    margin-left: 12px;
  }

  .subtask-section-title {
    color: var(--title);
  }

  .subtask-section-title-wrapper {
    display: flex;
    flex-direction: row;
  }

  .subtasks-list {
    margin-top: 24px;
  }

  .subtask-input-wrapper {
    display: flex;
    flex-direction: column;
    width: 100%;
    overflow: hidden;
    margin-left: 20px;
    margin-top: 8px;
  }
</style>
