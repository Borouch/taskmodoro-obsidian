<script lang="ts">
  import TaskDetailsNavigation from './TaskDetailsNavigation.svelte';
  import TaskDetailsSubtaskSection from './TaskDetailsSubtaskSection.svelte';
  import type { TaskDetails } from '../../TaskDetails';
  import { TaskDetailsMode } from '../../Enums/component-context';
  import Checkbox from '../Checkbox.svelte';
  import { onMount, afterUpdate } from 'svelte';
  import { renderMarkdown } from '../../Editor/RenderMarkdown';
  import Editor from '../Editor.svelte';
  import { allowOpenInternalLinks } from '../../Editor/InternalLink';
  import type { TFile } from 'obsidian';

import TaskStatusMenu from '../TaskStatusMenu.svelte'

  export let mainPanelEl: HTMLElement; 
  export let td: TaskDetails;
  export let mode: TaskDetailsMode;
  let taskNameDraft = td.taskName;
  let descriptionDraft = td.description;

  $: {
    updateDrafts(td.file!);
  }

  // Update drafts if a task with different file is pushed to the task details modal
  // This will happen when navigating parents-subtasks tree
  const updateDrafts = (_file: TFile) => {
    taskNameDraft = td.taskName;
    descriptionDraft = td.description;
  };

  let taskNameDisplayEl: HTMLElement;
  let descriptionDisplayEl: HTMLElement;

  let isEditMode = { description: false, taskName: false };

  type isEditModeKey = keyof typeof isEditMode;
  const renderDescMD = () => renderMD(descriptionDisplayEl, descriptionDraft);
  const renderTaskNameMD = () => renderMD(taskNameDisplayEl, taskNameDraft);

  onMount(() => {
    if (mode === TaskDetailsMode.Create) {
      isEditMode.taskName = true;
    } else {
      renderDescMD();
      renderTaskNameMD();
    }
  });

  afterUpdate(() => {
    if (!isEditMode.description) {
      renderDescMD();
    }
    if (!isEditMode.taskName) {
      renderTaskNameMD();
    }
  });

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

  const submitInput = () => {
    if (td.taskName !== taskNameDraft) {
      td.taskName = taskNameDraft;
      if (mode === TaskDetailsMode.Update) {
        td.plugin.fileInterface.updateTaskName(td.file!, td.taskName);
      }
    }

    if (td.description !== descriptionDraft) {
      td.description = descriptionDraft;
      if (mode === TaskDetailsMode.Update) {
        td.plugin.fileInterface.updateDescription(td.file!, td.description);
      }
    }
  };

  const toogleDisplayMode = (prop: isEditModeKey) => {
    if (isEditMode[prop]) {
      isEditMode[prop] = false;
      isEditMode = isEditMode;
    }
  };
  const toogleEditMode = (prop: isEditModeKey) => {
    if (!isEditMode[prop]) {
      isEditMode[prop] = true;
      isEditMode = isEditMode;
    }
  };

  const onSubmitInput = (prop: isEditModeKey) => {
    submitInput();
    toogleDisplayMode(prop);
  };
</script>

<div bind:this={mainPanelEl} class="main-task-panel">
  <TaskDetailsNavigation plugin={td.plugin} />
  <div class="task-container">
    <div class="tq__checkbox-wrapper">
      <Checkbox bind:td disabled={false} />
    </div>
    <div class="task-input__container ">
      <Editor
        onEnter={() => onSubmitInput('taskName')}
        onFocusout={() => onSubmitInput('taskName')}
        onClick={() => {
          toogleEditMode('taskName');
        }}
        placeholder="Task name"
        showEditor={isEditMode.taskName}
        bind:displayEl={taskNameDisplayEl}
        bind:text={taskNameDraft}
        displayContainerId="task-input__name"
        editContainerId="task-input__name"
      />
      <Editor
        onEnter={() => onSubmitInput('description')}
        onFocusout={() => onSubmitInput('description')}
        onClick={() => {
          toogleEditMode('description');
        }}
        placeholder="Description"
        showEditor={isEditMode.description}
        bind:displayEl={descriptionDisplayEl}
        bind:text={descriptionDraft}
        displayContainerId="task-input__description"
        editContainerId="task-input__description"
      />
    </div>
  </div>
  <TaskDetailsSubtaskSection bind:td {mode} />
  <TaskStatusMenu relativeEl={mainPanelEl}></TaskStatusMenu>
</div>

<style>
  .tq__checkbox-wrapper {
    margin-top: 10px;
  }

  .task-input__container {
    margin: 0 12px;
    margin-bottom: 24px;
    display: flex;
    flex-direction: column;
    width: 100%;
    overflow: hidden;
  }

  .task-container {
    display: flex;
    justify-content: flex-start;
    flex-direction: row;
  }

  .main-task-panel {
    position:relative;
    background-color: var(--main-panel-background);
    width: 70%;
    padding: 24px 24px;
    overflow-y: auto;
  }
</style>
