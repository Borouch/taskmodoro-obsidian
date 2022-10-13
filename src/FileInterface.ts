/* eslint-disable no-param-reassign */
import { App, Notice, TAbstractFile, TFile, Vault } from 'obsidian';
import type { Duration, Moment } from 'moment';
import { isArrayLike } from 'lodash';
import moment from 'moment';
import {
  Frontmatter,
  Parser,
  setCompletedDateLegacy,
  setDueDateToNext,
  setCompletedDate
} from './Parser';

import type TQPlugin from './main';
import type { TaskDetails } from './TaskDetails';

export interface Task {
  file: TFile;
  md: string;
  frontmatter: Frontmatter;
  taskName: string;
  description: string;
  tags: string[];
  recurrence: string;
  status: TaskStatus;
  due: Moment | null;
  scheduled: Moment | null;
  subtasks: Task[];
  parents: FileName[];
}
export type TaskStatus = 'uncompleted' | 'done' | 'failed';
export type FilePath = string;
export type FileName = string;
export type StatusHistory = { date: string; status: string }[] | null;

export class FileInterface {
  public static readonly descStartToken = '<!---DESC_START--->';
  public static readonly descEndToken = '<!---DESC_END--->';
  public readonly tasksDir: string;
  private readonly plugin: TQPlugin;
  private readonly app: App;

  public constructor(plugin: TQPlugin, app: App) {
    this.plugin = plugin;
    this.app = app;
    this.tasksDir = this.plugin.settings.TasksDir;
  }

  public readonly handleTaskModified = async (
    afile: TAbstractFile,
  ): Promise<void> => {
    return;
    // const tfile = this.app.metadataCache.getFirstLinkpathDest(afile.path, '/')
    // if (!tfile) {
    //   console.debug('taskmodoro: Unable to find TFile for TAFile: ' + afile.path)
    //   return
    // }

    // return modifyFileContents(
    //   tfile,
    //   this.app.vault,
    //   (lines: string[]): boolean => this.processRepeating(tfile.path, lines),
    // )
  };

  public readonly setTimerActivity = (
    file: TFile,
    start: Moment,
    end: Moment,
  ): void => {
    modifyFileContents(file, this.app.vault, (lines: string[]): boolean => {
      const frontmatter = this.getFrontmatter(lines);
      if (!frontmatter) return false;

      const format = 'YYYY-MM-DD H:m:s';
      const startStr = start.format(format);
      const endStr = end.format(format);
      const activity = { start: startStr, end: endStr };
      if (!frontmatter.contains('timer_activity')) {
        frontmatter.set('timer_activity', [activity]);
      } else {
        const ta = frontmatter.get('timer_activity');
        ta.push(activity);
      }

      frontmatter.overwrite();

      return true;
    });
  };
  public magic(reference:any, array:any) {
    Object.assign(reference, array, { length: array.length });
}
  public readonly updateFMProp = async (
    file: TFile,
    value: any,
    propName: string,
    appendArr = false,
    replacer: ((value: any, Frontmatter: Frontmatter) => any) | null = null,
  ): Promise<void> =>
    modifyFileContents(file, this.app.vault, (lines: string[]): boolean => {
      let frontmatter: Frontmatter;
      try {
        frontmatter = new Frontmatter(lines);
      } catch (error) {
        console.debug(error);
        return false;
      }

      if (appendArr) {
        value = this.appendValue(propName, value, frontmatter);
      }

      if (!appendArr && replacer) {
        value = replacer(value, frontmatter);
        console.log('replacer_value:', value);
      }

      frontmatter.set(propName, value);
      var _lines =frontmatter.overwrite();
      this.magic(lines,_lines)
      return true;
    });

  public readonly updateTaskName = async (
    file: TFile,
    taskName: string,
  ): Promise<void> => {
    const metadata = this.app.metadataCache.getFileCache(file);
    if (!metadata) return;
    let content = await this.app.vault.read(file);
    let contentLines = content.split('\n');
    const taskNameLines = taskName.split('\n');
    contentLines = Parser.replaceTaskName(
      contentLines,
      taskNameLines,
      metadata,
    );
    content = contentLines.join('\n');
    this.app.vault.modify(file, content);
  };

  public readonly updateDescription = async (
    file: TFile,
    description: string,
  ): Promise<void> => {
    let content = await this.app.vault.read(file);
    let contentLines = content.split('\n');
    const descLines = description.split('\n');
    contentLines = Parser.replaceDescription(contentLines, descLines);
    content = contentLines.join('\n');
    this.app.vault.modify(file, content);
  };



  /**
   * If task is non-repeating and has been unchecked then we remove completion date
   */
  public readonly processOnUnchecked = (lines: string[]): boolean => {
    const frontmatter = this.getFrontmatter(lines);
    if (!frontmatter) return false;
    frontmatter.set('status', 'uncompleted')
    if (
      !frontmatter.contains('recurrence') &&
      frontmatter.contains('status_history')
    ) {
      const statusHistory: StatusHistory = frontmatter.get('status_history');
      statusHistory!.pop();
      frontmatter.set('status_history', statusHistory);
      frontmatter.overwrite();
      return true;
    }
    return false;
  };


  //E,g done -> failed but not uncompleted -> done | failed
  // The latter case will be take care of by proccessOnCompleted

  public readonly changeCompletedStatus = (file: TFile, status: TaskStatus) => {
    this.updateFMProp(
      file,
      status,
      'status_history',
      false,
      (status: TaskStatus, frontMatter: Frontmatter) => {
        const today = window.moment().format('YYYY-MM-DD');
        frontMatter.set('status',status)
        if (frontMatter.contains('status_history')) {
          let statusHistory: StatusHistory = frontMatter.get('status_history');
          let idx = statusHistory!.findIndex((el) => {
            return el.date == today;
          });

          if (idx >= 0) {
            statusHistory![idx].status = status;
            // frontMatter.set('status_history',statusHistory)
            // frontMatter.overwrite()
          }
          return statusHistory
        }else {
          return [{date:today, status:status}]
        }
      },
    );
  };

  public readonly processOnCompleted = (
    path: FilePath,
    lines: string[],
    status: TaskStatus,
  ): boolean => {
    const frontmatter = this.getFrontmatter(lines);
    if (!frontmatter) return false;
    frontmatter.set('status', status)

    //Since task is completed it's completion date will be set
    setCompletedDate(frontmatter, status);

    if (frontmatter.contains('recurrence')) {
      this.processRecurring(frontmatter, lines, path);
    }

    frontmatter.overwrite();
    return true;
  };

  /**
   * processRecurring checks the provided lines to see if they describe a
   * recurring task and whether that task is checked. If so, the task is
   * unchecked, the due date updated according to the recurrence config, and the
   * current date added to the completed list in the frontmatter.
   * */
  private readonly processRecurring = (
    frontmatter: Frontmatter,
    lines: string[],
    path: FilePath,
  ) => {
    // Look for the task and check status
    const checkedTaskLine = lines.findIndex((line) => /^- \[[xX]\]/.test(line));
    if (checkedTaskLine < 0) {
      // Completed task not found, skip
      return false;
    }

    console.debug('taskmodoro: Reloading recurring task in ' + path);

    // Uncheck the task
    lines[checkedTaskLine] = lines[checkedTaskLine].replace(/\[[xX]\]/, '[ ]');
    frontmatter.set('status', 'uncompleted');
    setDueDateToNext(frontmatter);

    new Notice('New task repetition created');
    return true;
  };

  public readonly storeNestedTasks = async (
    td: TaskDetails,
  ): Promise<string> => {
    const subtasksFileNames: string[] = [];

    // First we store subtasks recursively and get their file names
    for (const subtask of td.subtasks) {
      const fileName = await this.storeNestedTasks(subtask);
      subtasksFileNames.push(fileName);
    }

    // Then we store current task
    const currTaskPath = await this.storeNewTask(
      td.taskName,
      td.description,
      td.pomodoroLenght,
      td.estWorktime,
      td.dailyScheduledWorktime,
      td.due,
      td.scheduled,
      td.recurrence,
      td.cleanedTags,
      subtasksFileNames,
    );

    // Update all subtasks frontmatter `parents` property to current task
    for (const fileName of subtasksFileNames) {
      const subtaskFile = this.app.metadataCache.getFirstLinkpathDest(
        `${this.tasksDir}/${fileName}`,
        '/',
      );
      if (!subtaskFile) continue;
      this.updateFMProp(subtaskFile, currTaskPath, 'parents', true);
    }

    return currTaskPath;
  };

  public readonly storeNewTask = async (
    taskName: string,
    description: string,
    pomoDuration: Duration,
    estWorktime: Duration,
    dailyScheduledWorktime: Duration,
    due: string,
    scheduled: string,
    recurrence: string,
    tags: string[],
    subtasksNames: FileName[],
  ): Promise<string> => {
    const hash = this.createTaskBlockHash();
    const fileName = `${hash}.md`;
    const filePath = `${this.tasksDir}/${fileName}`;
    const data = this.formatNewTask(
      taskName,
      description,
      pomoDuration,
      estWorktime,
      dailyScheduledWorktime,
      due,
      scheduled,
      recurrence,
      tags,
      subtasksNames,
    );

    console.debug('taskmodoro: Creating a new task in ' + filePath);
    console.debug(data);

    if (!(await this.app.vault.adapter.exists(this.tasksDir))) {
      await this.app.vault.createFolder(this.tasksDir);
    }
    await this.app.vault.create(filePath, data);

    return fileName;
  };

  private readonly appendValue = (
    propName: string,
    value: any,
    frontmatter: Frontmatter,
  ): any => {
    const fmArr = frontmatter.get(propName);
    if (!fmArr) {
      value = [value];
    }
    if (fmArr && isArrayLike(fmArr)) {
      value = [...fmArr, value];
    }
    return value;
  };

  /**
   * @return YAML frontmatter
   */
  private readonly formatNewTask = (
    taskName: string,
    description: string,
    pomoDuration: Duration,
    estWorktime: Duration,
    dailyScheduledWorktime: Duration,
    due: string,
    scheduled: string,
    reccurence: string,
    tags: string[],
    subtasksNames: string[],
  ): string => {
    const frontMatter = [];

    const createdAt = moment(new Date()).toISOString();
    frontMatter.push(`created_at: ${createdAt}`);

    if (pomoDuration) {
      const pomoLen = `  minutes: ${pomoDuration.asMinutes()}`;
      frontMatter.push(`pomodoro_length:\n${pomoLen}`);
    }

    if (estWorktime) {
      const fmM = `  minutes: ${estWorktime.asMinutes()}`;
      frontMatter.push(`estimated_worktime:\n${fmM}`);
    }

    if (dailyScheduledWorktime) {
      const now = window.moment().format('YYYY-MM-DD');
      const prop = `  '${now}':\n    minutes: ${dailyScheduledWorktime.asMinutes()}`;
      frontMatter.push(`daily_scheduled_worktime:\n${prop}`);
    }

    if (due) {
      frontMatter.push(`due: '${due}'`);
    }

    if (scheduled) {
      frontMatter.push(`scheduled: '${scheduled}'`);
    }

    if (reccurence) {
      frontMatter.push('recurrence: ' + reccurence);
    }

    if (tags && tags.length > 0 && tags[0].length > 0) {
      let tagsFm = '';
      for (const tag of tags) {
        tagsFm += `\n  - '${tag}'`;
      }
      frontMatter.push(`tags:${tagsFm}`);
    }

    if (subtasksNames.length !== 0) {
      let subtasks = '';
      for (const name of subtasksNames) {
        subtasks += `\n  - ${name}`;
      }
      frontMatter.push(`subtasks:${subtasks}`);
    }

    const contents = [];
    if (frontMatter.length > 0) {
      contents.push('---');
      contents.push(...frontMatter);
      contents.push('---');
      contents.push('');
    }
    contents.push('## Task');
    contents.push('- [ ] ' + taskName);

    contents.push(
      `\n ${FileInterface.descStartToken}\n${description}\n${FileInterface.descEndToken}`,
    );

    return contents.join('\n');
  };

  private readonly createTaskBlockHash = (): string => {
    let hash = 'task-';
    const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < 6; i++) {
      hash += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return hash;
  };

  private getFrontmatter = (lines: string[]): Frontmatter | null => {
    try {
      return new Frontmatter(lines);
    } catch (error) {
      console.debug(error);
      return null;
    }
  };
}

/**
 * Read the file contents and pass to the provided function as a list of lines.
 * If the provided function returns true, write the array back to the file.
 * NOTE: If useCache is true, the fn is not allowed to update the file!
 */
export const modifyFileContents = async (
  file: TFile,
  vault: Vault,
  modificator: (lines: string[]) => boolean,
): Promise<void> => {
  const fileContents = (await vault.read(file)) || '';
  const lines = fileContents.split('\n');

  const modified = modificator(lines);
  if (modified) {
    return vault.modify(file, lines.join('\n'));
  }
};
