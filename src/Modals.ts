import { App, Modal } from 'obsidian';
import type { Duration, Moment } from 'moment';

import DatePicker from './UI/pickers/DuePicker.svelte';
import DurationPicker from './UI/pickers/DurationPicker/DurationPicker.svelte';
import type { DurationPickerType } from './Enums/duration-picker-type';
import RecurrencePicker from './UI/Pickers/RepeatPicker.svelte';
import type TQPlugin from './main';

import type { TaskDetailsMode } from './Enums/component-context';
import TaskDetailsUI from './UI/TaskDetails/TaskDetailsUI.svelte';
import type { TaskDetails } from './TaskDetails';
import DeletePopup from './UI/DeletePopup.svelte';

export class DeleteTaskModal extends Modal {

  constructor(private td:TaskDetails) {
    super(td.plugin.app);
  }

  public onOpen = (): void => {
      const { modalEl,contentEl, titleEl} = this;
       modalEl.addClass('delete-popup')
      titleEl.innerText="Are you sure you want to delete this task?"
      titleEl.addClass('delete-popup-title')
      new DeletePopup({
          target: contentEl,
          props: {
              td: this.td,
              close: () => this.close()
          },
      });
  };
  public onClose(){

  }

}

export class TaskDetailsModal extends Modal {
  private readonly mode: TaskDetailsMode;
  private readonly plugin: TQPlugin;
  constructor(plugin: TQPlugin, mode: TaskDetailsMode) {
    super(plugin.app);
    this.plugin = plugin;
    this.mode = mode;
  }

  public onOpen = (): void => {
    const { contentEl, modalEl } = this;
    modalEl.addClasses(['taskmodoro-modal', 'taskmodoro']);
    contentEl.addClass('taskmodoro-modal-content');
    new TaskDetailsUI({
      target: contentEl,
      props: {
        close: () => this.close(),
        plugin: this.plugin,
        mode: this.mode,
      },
    });
  };

  public onClose = (): void => {
    const { contentEl } = this;

    contentEl.empty();
    const tasksNav = this.plugin.taskNav.tasksNavigation;
    tasksNav.set([]);
  };
}

export class DurationPickerModal extends Modal {
  private readonly title: string;
  private readonly duration: Duration;
  private readonly set: (duration: Duration) => void;
  private readonly type: DurationPickerType;
  constructor(
    app: App,
    title: string,
    duration: Duration,
    type: DurationPickerType,
    set: (duration: Duration) => void,
  ) {
    super(app);
    this.title = title;
    this.duration = duration;
    this.type = type;
    this.set = set;
  }

  public onOpen = (): void => {
    const { titleEl, contentEl } = this;
    titleEl.setText(this.title);
    new DurationPicker({
      target: contentEl,
      props: {
        close: () => this.close(),
        set: this.set,
        duration: this.duration,
        type: this.type,
      },
    });
  };

  public onClose = (): void => {
    const { titleEl, contentEl } = this;
    titleEl.empty();
    contentEl.empty();
  };
}

export class DatePickerModal extends Modal {
  private readonly startDate: Moment;
  private readonly set: (date: Moment) => void;
  private readonly title: string;
  constructor(
    app: App,
    startDate: Moment,
    title: string,
    set: (date: Moment) => void,
  ) {
    super(app);

    this.startDate = startDate;
    this.set = set;
    this.title = title;
  }

  public onOpen = (): void => {
    const { titleEl, contentEl } = this;
    titleEl.setText(this.title);
    new DatePicker({
      target: contentEl,
      props: {
        close: () => this.close(),
        set: this.set,
        startDate: this.startDate,
      },
    });
  };

  public onClose = (): void => {
    const { contentEl } = this;
    contentEl.empty();
  };
}

export class RecurrencePickerModal extends Modal {
  private readonly recurrence: string;
  private readonly set: (recurrence: string) => void;

  constructor(app: App, recurrence: string, set: (recurrence: string) => void) {
    super(app);

    this.recurrence = recurrence;
    this.set = set;
  }

  public onOpen = (): void => {
    const { titleEl, contentEl } = this;
    titleEl.setText('Set Repeat Config');
    new RecurrencePicker({
      target: contentEl,
      props: {
        close: () => this.close(),
        set: this.set,
        recurrence: this.recurrence,
      },
    });
  };

  public onClose = (): void => {
    const { contentEl } = this;
    contentEl.empty();
  };
}
