import { toInteger } from 'lodash';
import type { Duration } from 'moment';
import moment from 'moment';
import type { TFile } from 'obsidian';
import type { Moment } from 'moment';
import type TQPlugin from './main';
import { durationFormat, formatDate } from './Helpers/Helpers';
import type { FileName, Task } from './FileInterface';
import type { TaskStatus } from './FileInterface';

export class TaskDetails {
  public plugin: TQPlugin;
  public file?: TFile;
  public taskName = '';
  public description = '';
  public status: TaskStatus = 'uncompleted';
  public recurrence = '';
  public due = '';
  public scheduled = '';
  public tags = '';
  public pomodoroLenght = moment.duration(30, 'minutes');
  public overallWorktime = moment.duration(0, 'seconds');
  public dailyWorktime = moment.duration(0, 'seconds');
  public dailyScheduledWorktime?: Duration ;
  public estWorktime?: Duration;
  public subtasks: TaskDetails[] = [];
  public parents: FileName[] = [];

  public get hasCompletionStatus() {
    return this.status !== 'uncompleted';
  }

  // Callback for closing TaskDetailsModal
  public close?: () => void;

  public getWorktimeStr(worktime: Duration | undefined): string {
    const estWorktimeStr =
      !worktime || worktime.asMinutes() === 0
        ? 'None'
        : `${durationFormat(worktime)}`;
    return estWorktimeStr;
  }

  constructor(
    plugin: TQPlugin,
    task: Task | null = null,
    close: (() => void) | null = null,
  ) {
    this.plugin = plugin;
    if (close) {
      this.close = close;
    }
    if (task) {
      const fm = task.frontmatter;
      this.due = formatDate(task.due);
      this.recurrence = task.recurrence;
      this.scheduled = formatDate(task.scheduled);
      this.taskName = task.taskName;
      this.description = task.description;
      this.status = task.status;
      this.file = task.file;
      const pomoLen = toInteger(fm.get('pomodoro_length')?.minutes) || 30;
      this.pomodoroLenght = moment.duration(pomoLen, 'minutes');
      const now = moment().format('YYYY-MM-DD');
      const dailyScheduledWorktime = fm.get('daily_scheduled_worktime');
      if (dailyScheduledWorktime && dailyScheduledWorktime[now]) {
        this.dailyScheduledWorktime = moment.duration(
          dailyScheduledWorktime[now],
          'minutes',
        );
      }
      const estWorklength = fm.get('estimated_worktime')?.minutes;

      if (estWorklength) {
        this.estWorktime = moment.duration(estWorklength, 'minutes');
      }
      this.tags = task.tags.join(' ');

      const ta: [{ start: string; end: string }] = fm.get('timer_activity');

      if (ta) {
        ta.forEach((a) => {
          const diff = moment(a.end).diff(moment(a.start), 'minutes');
          this.overallWorktime.add(diff, 'minutes');
          this.addToDailyWorktime(a.start, a.end, now, diff);
        });
      }
      const subtasks: Task[] = task.subtasks;

      for (const subtask of subtasks) {
        const subtd = new TaskDetails(this.plugin, subtask, close);
        this.subtasks.push(subtd);
      }

      this.parents = task.parents ? task.parents : [];
    }
  }

  public get cleanedTags(): string[] {
    return this.cleanTags(this.tags);
  }

  // Seperate method to leverage svelte reactivity
  public cleanTags(tags: string): string[] {
    return tags.split(/[ ]+/).filter((x) => x !== '');
  }

  public create = async (): Promise<string> => {
    const fileName = this.plugin.fileInterface.storeNestedTasks(this);

    if (this.close) {
      this.close();
    }
    return fileName;
  };

  private addToDailyWorktime(
    start: string,
    end: string,
    now: string,
    diff: number,
  ) {
    if (now === moment(start).format('YYYY-MM-DD')) {
      if (now !== moment(end).format('YYYY-MM-DD')) {
        const endDate = moment(end).subtract(1, 'day').endOf('day');
        diff = endDate.diff(moment(start), 'minutes');
      }
      this.dailyWorktime.add(diff, 'minutes');
    }
  }
}
