<script lang="ts">
  import OptionsBtn from './../OptionsBtn.svelte';
  import type { TaskDetails } from '../../TaskDetails';
  import { TaskDetailsMode } from '../../Enums/component-context';

  import TextSuggest from '../TextSuggest.svelte';
  import TimerOpenBtn from '../TimerOpenBtn.svelte';
  import ViewSourceBtn from '../ViewSourceBtn.svelte';
  import { onMount } from 'svelte';
  import {
    showEstWorktimePicker,
    showDailyScheduleWorktimePicker,
  } from '../../Helpers/ShowPickers';
  import {
    showRecurrencePicker,
    showPomoLengthPicker,
  } from '../../Helpers/ShowPickers';
  import {
    showDueDatePicker,
    showScheduledDatePicker,
  } from '../../Helpers/ShowPickers';
  import TaskDetailsSidebarProp from './TaskDetailsSidebarProp.svelte';
  import moment from 'moment';
  import type { Frontmatter } from '../../Parser';
  import OptionsMenu from './../OptionsMenu.svelte';
  export let td: TaskDetails;
  export let mode: TaskDetailsMode;

  const tagCache = Object.keys((td.plugin.app.metadataCache as any).getTags());
  let isCreateBtnEnabled = true;
  $: {
    isCreateBtnEnabled = td.taskName != '';
  }

  onMount(() => {
    if (mode === TaskDetailsMode.Create) {
      if (td.parents.length === 0) {
        td.tags = td.plugin.settings.RootTasksTags + td.tags;
      }
    }
  });

  const updateTagsFm = () => {
    if (mode == TaskDetailsMode.Update) {
      td.plugin.fileInterface.updateFMProp(td.file!, td.cleanedTags, 'tags');
    }
  };
  const showPomodoroTaskView = async () => {
    await td.plugin.activatePomodoroTaskView(td);
    td.close!();
  };

  const updater = () => {
    td = td;
  };

  const dailyScheduledWorktimeOnReset = () => {
    td.dailyScheduledWorktime = null;

    const replacer = (_value: any, frontmatter: Frontmatter) => {
      const now = moment().format('YYYY-MM-DD');
      let dailyScheduledWorktime: { [key: string]: Object } = frontmatter.get(
        'daily_scheduled_worktime',
      );
      delete dailyScheduledWorktime[now];
      return dailyScheduledWorktime;
    };

    if (mode === TaskDetailsMode.Update) {
      td.plugin.fileInterface.updateFMProp(
        td.file!,
        undefined,
        'daily_scheduled_worktime',
        false,
        replacer,
      );
    }
  };

  const estWorktimeOnReset = () => {
    td.estWorktime = undefined;
    if (mode === TaskDetailsMode.Update) {
      td.plugin.fileInterface.updateFMProp(
        td.file!,
        undefined,
        'estimated_worktime',
      );
    }
  };

  const pomodoroLengthOnReset = () => {
    td.pomodoroLenght = moment.duration(30, 'minutes');
    if (mode === TaskDetailsMode.Update) {
      td.plugin.fileInterface.updateFMProp(
        td.file!,
        { minutes: 30 },
        'pomodoro_length',
      );
    }
  };

  const recurrenceOnReset = () => {
    td.recurrence = '';
    if (mode === TaskDetailsMode.Update) {
      td.plugin.fileInterface.updateFMProp(td.file!, undefined, 'recurrence');
    }
  };

  const scheduledOnReset = () => {
    td.scheduled = '';
    if (mode === TaskDetailsMode.Update) {
      td.plugin.fileInterface.updateFMProp(td.file!, undefined, 'scheduled');
    }
  };

  const dueOnReset = () => {
    td.due = '';
    if (mode === TaskDetailsMode.Update) {
      td.plugin.fileInterface.updateFMProp(td.file!, undefined, 'due');
    }
  };

  let sidePaneEl: HTMLElement;
</script>

<div bind:this={sidePaneEl} class="task-details__side-panel">
  <span class="side-panel__external-actions-container">
    {#if mode !== TaskDetailsMode.Create}
      <TimerOpenBtn on:click={showPomodoroTaskView} />
    {/if}
    {#if mode === TaskDetailsMode.Update}
      <!-- <DeleteTaskBtn {td} /> -->
      <ViewSourceBtn
        file={td.file}
        classes="external-link-wrapper"
        plugin={td.plugin}
        close={td.close}
      />
      <div class="flex-spacer" />
      <OptionsBtn {td} />
    {/if}
  </span>
  <div class="side-panel__container">
    <TaskDetailsSidebarProp
      propLabel="Due date"
      onSelect={() => {
        showDueDatePicker(td, mode, updater);
      }}
      onReset={dueOnReset}
      value={!td.due ? 'Someday' : td.due}
    />

    <TaskDetailsSidebarProp
      propLabel="Scheduled date"
      onSelect={() => {
        showScheduledDatePicker(td, mode, updater);
      }}
      onReset={scheduledOnReset}
      value={!td.scheduled ? 'Someday' : td.scheduled}
    />

    <TaskDetailsSidebarProp
      propLabel="Recurrence"
      onSelect={() => {
        showRecurrencePicker(td, mode, updater);
      }}
      onReset={recurrenceOnReset}
      value={!td.recurrence ? 'None' : td.recurrence}
    />

    <TaskDetailsSidebarProp
      propLabel="Pomodoro length"
      onSelect={() => {
        showPomoLengthPicker(td, mode, updater);
      }}
      onReset={pomodoroLengthOnReset}
      value={`${td.pomodoroLenght.asMinutes()}min`}
    />

    <TaskDetailsSidebarProp
      propLabel="Estimated worktime"
      onSelect={() => {
        showEstWorktimePicker(td, mode, updater);
      }}
      onReset={estWorktimeOnReset}
      value={td.getWorktimeStr(td.estWorktime)}
    />

    <TaskDetailsSidebarProp
      propLabel="Daily scheduled worktime"
      onSelect={() => {
        showDailyScheduleWorktimePicker(td, mode, updater);
      }}
      onReset={dailyScheduledWorktimeOnReset}
      value={td.getWorktimeStr(td.dailyScheduledWorktime)}
    />

    <div class="group">
      <div class="prop__label">Tags</div>
      <TextSuggest
        classes={'tag-input'}
        app={td.plugin.app}
        suggestions={tagCache}
        placeholder="Add a tag"
        bind:value={td.tags}
        onFocusout={updateTagsFm}
      />
    </div>
  </div>
  {#if mode === TaskDetailsMode.Create}
    <div class="create-btn-wrapper">
      <button
        disabled={!isCreateBtnEnabled}
        class="mod-cta create-btn
                                {isCreateBtnEnabled ? '' : 'disabled-btn'}"
        on:click={td.create}>Create</button
      >
    </div>
  {/if}
  <OptionsMenu relativeEl={sidePaneEl} />
</div>

<style>
  .flex-spacer {
    flex-grow: 1;
  }

  :global(.task-details__side-panel .tag-input) {
    padding-bottom: 8px;
    border-bottom: 1px solid var(--input-border);
  }

  .create-btn {
    width: 100%;
  }

  .create-btn-wrapper {
    display: flex;
    flex-direction: column;
    justify-content: end;
  }

  .side-panel__external-actions-container {
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    gap: 16px;
  }

  .task-details__side-panel {
    position: relative;
    background-color: var(--side-panel-background);
    width: 30%;
    padding: 24px 24px;
  }

  .side-panel__container {
    padding: 24px 0px;
  }

  .group {
    padding-bottom: 24px;
  }

  .prop__label {
    font-size: 1rem;
    padding-bottom: 8px;
    color: var(--text-muted);
  }
</style>
