import { dump, load } from 'js-yaml';

import type { CachedMetadata } from 'obsidian';
import { RRule } from 'rrule';
import moment from 'moment';
import { FileInterface, TaskStatus, StatusHistory } from './FileInterface';
import { formatDate } from './Helpers/Helpers';

type Moment = moment.Moment;

export class Parser {
  public static readonly taskRegex = /- \[[xX ]\] /;

  public static readonly getTaskData = (
    content: string[],
  ): { isTaskCompleted: boolean; taskName: string } => {
    // We do it manually rather than using CachedMetadata because of the edge cases
    // where cache is not updating in time and causing bugs in task name fetch
    const taskIndex = content.findIndex((line) => this.taskRegex.test(line));
    if (taskIndex >= 0) {
      const completed = /^- \[[xX]\] /;
      // We check task status this way to make cross-compatible with previous versions
      const isTaskCompleted = completed.test(content[taskIndex]);
      const taskName = content[taskIndex].replace(this.taskRegex, '');
      return { isTaskCompleted, taskName };
    }

    return { isTaskCompleted: false, taskName: 'Task name not found' };
  };

  public static readonly replaceTaskName = (
    content: string[],
    taskName: string[],
    metadata: CachedMetadata,
  ): string[] => {
    const start = metadata.listItems[0].position.start.line;
    const end = metadata.listItems[0].position.end.line;
    let prefix = '';
    const isTaskCompleted = ['x', 'X'].contains(metadata.listItems[0].task);
    if (isTaskCompleted) {
      prefix = '- [x] ';
    } else {
      prefix = '- [ ] ';
    }
    taskName[0] = prefix + taskName[0];
    const deleteCount = end + 1 - start;
    content.splice(start, deleteCount, ...taskName);
    return content;
  };

  public static readonly replaceDescription = (
    content: string[],
    description: string[],
  ): string[] => {
    const descStart = content.findIndex((line) =>
      line.includes(FileInterface.descStartToken),
    );
    const descEnd = content.findIndex((line) =>
      line.includes(FileInterface.descEndToken),
    );
    const deleteCount = descEnd - 1 - descStart;
    if (descStart === -1 || descEnd === -1) return;

    content.splice(descStart + 1, deleteCount, ...description);
    return content;
  };

  public static readonly getDescription = (content: string[]): string => {
    const descStart = content.findIndex((line) =>
      line.includes(FileInterface.descStartToken),
    );
    const descEnd = content.findIndex((line) =>
      line.includes(FileInterface.descEndToken),
    );
    if (descStart === -1 || descEnd === -1) return '';
    const descLines = content.slice(descStart + 1, descEnd);
    const description = descLines.join('\n');
    return description;
  };
}

export class Frontmatter {
  // TODO: Use index signatures?
  // [s: string]: any

  /**
   * YAML as list of string
   */
  private readonly lines: string[];

  /**
   * Index of the first YAML content line
   */
  private start: number;

  /**
   * Index of the last YAML content line
   */
  private end: number;

  /**
   * YAML as key value pairs
   */
  private contents: { [k: string]: any };

  constructor(lines: string[]) {
    this.lines = lines;
    this.initBoundaries();
    this.parse();
  }

  public readonly contains = (key: string): boolean => key in this.contents;
  public readonly get = (key: string): any => this.contents[key];
  public readonly set = (key: string, value: any): void =>
    (this.contents[key] = value);

  public readonly overwrite = (): string[] => {
    const replacer = (k: string, v: any): any =>
      moment.isMoment(v) ? v.endOf('day').format('YYYY-MM-DD') : v;

    const fmLines = dump(this.contents, { replacer }).trim();

    if (this.start === -1 || this.end === -1) {
      // If there was no frontmatter, add it now
      this.lines.unshift('');
      this.lines.unshift('---');
      this.lines.unshift(fmLines);
      this.lines.unshift('---');
    } else {
      const deleteCount = this.end - this.start + 1;
      this.lines.splice(this.start, deleteCount, fmLines);
    }
    return this.lines;
  };

  private readonly initBoundaries = (): void => {
    this.start = this.lines.findIndex((line) => line === '---') + 1;
    if (this.start === 0) {
      console.debug('taskmodoro: No frontmatter found for note');
      this.start = -1;
      this.end = -1;
      return;
    }

    this.end =
      this.lines.slice(this.start).findIndex((line) => line === '---') +
      this.start -
      1;
  };

  /**
   * Serializes YAML string
   */
  private readonly parse = (): void => {
    if (this.start < 0 || this.end < this.start) {
      this.contents = {};
      return;
    }
    const fmLines = this.lines.slice(this.start, this.end + 1).join('\n');
    const fm = load(fmLines);
    if (typeof fm === 'string' || typeof fm === 'number') {
      throw new Error('taskmodoro: Unexpected type of frontmatter');
    }

    this.contents = fm;
  };
}

export const setCompletedDateLegacy = (frontmatter: Frontmatter): void => {
  // Add the current date to the 'completed' frontmatter
  const today = window.moment().format('YYYY-MM-DD');
  if (!frontmatter.contains('completed')) {
    frontmatter.set('completed', [today]);
    return;
  }

  const cur = frontmatter.get('completed');
  if (typeof cur === 'string') {
    frontmatter.set('completed', [cur, today]);
  } else if (Array.isArray(cur)) {
    cur.push(today);
  } else {
    console.warn(
      'taskmodoro: Unexpected type for completed field in frontmatter',
    );
  }
};

export const setCompletedDate = (
  frontmatter: Frontmatter,
  status: TaskStatus,
): void => {
  // Add the current date to the 'completed' frontmatter
  const today = window.moment().format('YYYY-MM-DD');
  if (!frontmatter.contains('status_history')) {
    frontmatter.set('status_history', [{ date: today, status: status }]);
    return;
  }

  const statusHistory: StatusHistory = frontmatter.get('status_history');
  if (Array.isArray(statusHistory)) {
    statusHistory.push({ date: today, status: status });
    frontmatter.set('status_history', statusHistory);
  } else {
    console.warn(
      'taskmodoro: Unexpected type for status_history field in frontmatter',
    );
  }
};

export const setDueDateToNext = (frontmatter: Frontmatter): void => {
  const recurrence = frontmatter.get('recurrence');
  const repeater = RRule.fromText(recurrence);
  const next = repeater.after(window.moment.utc().endOf('day').toDate());
  const due = window.moment(next).startOf('day').toDate();
  frontmatter.set('due', due);
};
