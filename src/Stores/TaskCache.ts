import type { App, CachedMetadata, TFile } from 'obsidian';
/* eslint-disable linebreak-style */
import { Result, err, ok } from 'neverthrow';
import { Writable, get, writable } from 'svelte/store';
import { FilePath, Task, modifyFileContents } from '../FileInterface';
import { Frontmatter, Parser } from '../Parser';

import type TQPlugin from '../main';
import type { TaskDetails } from '../TaskDetails';

/**
 * TaskCache is the main interface for querying and modifying tasks. It
 * implements a Svelte store, so changes to the underlying tasks can be
 * automatically reflected in the UI.
 */

export class TaskCache {
  public tasks: Writable<Record<FilePath, Task>>;

  private readonly plugin: TQPlugin;

  private readonly app: App;

  public constructor(plugin: TQPlugin, app: App) {
    this.plugin = plugin;

    this.app = app;

    this.tasks = writable({});

    // this.tasks.subscribe(() => {
    //     console.log('taskCache has been updated');
    // });
  }

  /**
   * toggleChecked will update the task file to the state represented in this
   * task object. The task object will not be modified, though the modifiction
   * of the file will trigger that task to be reloaded and the UI to be
   * rerendered.
   */

  public readonly toggleChecked = async (td: TaskDetails): Promise<void> =>
    modifyFileContents(td.file, this.app.vault, (lines): boolean => {
      const replacer = td.completed ? /^- \[[ ]\]/ : /^- \[[xX]\]/;

      const newValue = td.completed ? '- [x]' : '- [ ]';

      // Look for the task and check status

      const taskLine = lines.findIndex((line) => replacer.test(line));

      if (taskLine < 0) {
        console.warn(
          'taskmodoro: Unable to find a task line to toggle in file ' +
            td.file.path,
        );

        return false;
      }

      lines[taskLine] = lines[taskLine].replace(replacer, newValue);

      // We update this here rather than waiting for the file modified handler

      // so that the file is only updated once, rather than twice in rapid

      // succession.

      if (!td.completed) {
        this.plugin.fileInterface.processUnchecked(lines);
      } else {
        this.plugin.fileInterface.processCompleted(td.file.path, lines);
      }

      return true;
    });

  /**
   * Update svelte store of tasks by replacing stores` key: (newTask.file.path) with value: (newTask) parsed from modified task file.
   */
  public readonly handleTaskModified = async (file: TFile): Promise<void> => {
    (await this.loadTask(file)).match(
      (newTask) => {
        // console.log('task-loaded:', newTask.taskName);

        this.tasks.update((tasks): Record<FilePath, Task> => {
          tasks[newTask.file.path] = newTask;

          return tasks;
        });

        this.updateParentsCache(newTask);
      },

      (e) => {
        console.error(e);
      },
    );
  };

  public updateParentsCache = (task: Task): void => {
    if (!task || !task.parents) return;

    for (const parentName of task.parents) {
      const dir = this.plugin.fileInterface.tasksDir;

      const parentPath = `${dir}/${parentName}`;

      this.tasks.update((tasks): Record<FilePath, Task> => {
        const parentTask = tasks[parentPath];

        if (!parentTask) return tasks;

        const subtaskIndex = parentTask.subtasks.findIndex(
          (subtask) => task.file.name === subtask.file.name,
        );

        parentTask.subtasks[subtaskIndex] = task;

        tasks[parentPath] = parentTask;

        return tasks;
      });

      this.updateParentsCache(get(this.tasks)[parentPath]);
    }
  };

  public readonly handleTaskDeleted = (path: string): void => {
    this.tasks.update((tasks): Record<FilePath, Task> => {
      delete tasks[path];

      return tasks;
    });
  };

  public readonly getTasksFromFileNames = async (
    fileNames: string[],
  ): Promise<Task[]> => {
    if (!fileNames) return [];

    const tasksDir = this.plugin.fileInterface.tasksDir;

    const subtasks: Task[] = [];

    for (const fileName of fileNames) {
      const path = `${tasksDir}/${fileName}`;

      const file = this.app.metadataCache.getFirstLinkpathDest(path, '/');

      if (file) {
        const task = await this.loadTask(file);

        task.match(
          (t) => {
            subtasks.push(t);
          },

          (err) => {
            console.debug(err);
          },
        );
      }
    }

    return subtasks;
  };

  public isTaskAbsent = (metadata: CachedMetadata): boolean =>
    !metadata.listItems ||
    metadata.listItems.length < 1 ||
    metadata.listItems[0].task === undefined;

  private readonly loadTask = async (
    file: TFile,
  ): Promise<Result<Task, string>> => {
    const metadata = this.app.metadataCache.getFileCache(file);

    if (this.isTaskAbsent(metadata)) {
      return err('taskmodoro: No task found in task file ' + file.path);
    }

    const contents = await this.app.vault.read(file);
    const lines = contents.split('\n');
    const frontmatter = new Frontmatter(lines);
    const due = frontmatter.get('due');
    const scheduled = frontmatter.get('scheduled');
    const subtasks = await this.getTasksFromFileNames(
      frontmatter.get('subtasks'),
    );
    const parents = frontmatter.get('parents');
    const taskData = Parser.getTaskData(lines);
    const tags = frontmatter.get('tags');

    return ok({
      file,
      md: contents,
      frontmatter,
      taskName: taskData.taskName,
      recurrence: frontmatter.get('recurrence'),
      description: Parser.getDescription(lines),
      completed: taskData.isTaskCompleted,
      tags: tags ? tags : [],
      due: due ? window.moment(due).endOf('day') : null,
      scheduled: scheduled ? window.moment(scheduled).endOf('day') : undefined,
      subtasks,
      parents,
    });
  };
}
