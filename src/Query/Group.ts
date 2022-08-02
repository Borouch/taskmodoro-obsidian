/* eslint-disable eqeqeq */
/* eslint-disable @typescript-eslint/member-ordering */
import type { Grouping, GroupingProperty } from '../Query';

import { Task } from '../FileInterface';
import { TaskGroups } from './TaskGroups';

// Reproduced from: https://github.com/obsidian-tasks-group/obsidian-tasks

/**
 * A naming function, that takes a Task object and returns the corresponding group property name
 */
type Grouper = (task: Task) => string[];

/**
 * Implementation of the 'group by' instruction.
 */
export class Group {
    private static readonly groupDateFormat = 'YYYY-MM-DD dddd';

    /**
     * Group a list of tasks, according to one or more task properties
     * @param grouping 0 or more Grouping values, one per 'group by' line
     * @param tasks The tasks that match the task block's Query
     */
    public static by(grouping: Grouping[], tasks: Task[]): TaskGroups {
        return new TaskGroups(grouping, tasks);
    }

    /**
     * Return the properties of a single task for the passed grouping property
     * @param property
     * @param task
     */
    public static getGroupNamesForTask(
        property: GroupingProperty,
        task: Task,
    ): string[] {
        const grouper = Group.groupers[property];
        return grouper(task);
    }

    private static readonly groupers: Record<GroupingProperty, Grouper> = {
        // backlink: Group.groupByBacklink,
        // done: Group.groupByDoneDate,
        due: Group.groupByDueDate,
        // filename: Group.groupByFileName,
        // folder: Group.groupByFolder,
        // happens: Group.groupByHappensDate,
        // heading: Group.groupByHeading,/
        // path: Group.groupByPath,/
        // priority: Group.groupByPriority,
        recurrence: Group.groupByRecurrence,
        recurring: Group.groupByRecurring,
        // root: Group.groupByRoot,
        scheduled: Group.groupByScheduledDate,
        // start: Group.groupByStartDate,
        completed: Group.groupByCompleted,
        tags: Group.groupByTags,
    };

    // private static groupByPriority(task: Task): string[] {
    //     let priorityName = 'ERROR';
    //     switch (task.priority) {
    //         case Priority.High:
    //             priorityName = 'High';
    //             break;
    //         case Priority.Medium:
    //             priorityName = 'Medium';
    //             break;
    //         case Priority.None:
    //             priorityName = 'None';
    //             break;
    //         case Priority.Low:
    //             priorityName = 'Low';
    //             break;
    //     }
    //     return [`Priority ${task.priority}: ${priorityName}`];
    // }

    private static groupByRecurrence(task: Task): string[] {
        if (task.recurrence != null) {
            return [task.recurrence];
        }
        return ['None'];

    }

    private static groupByRecurring(task: Task): string[] {
        if (task.recurrence != null) {
            return ['Recurring'];
        }
        return ['Not Recurring'];

    }

    // private static groupByStartDate(task: Task): string[] {
    //     return [Group.stringFromDate(task.startDate, 'start')];
    // }

    private static groupByScheduledDate(task: Task): string[] {
        return [Group.stringFromDate(task.scheduled, 'scheduled')];
    }

    private static groupByDueDate(task: Task): string[] {
        return [Group.stringFromDate(task.due, 'due')];
    }

    // private static groupByDoneDate(task: Task): string[] {
    //     return [Group.stringFromDate(task.doneDate, 'done')];
    // }

    // private static groupByHappensDate(task: Task): string[] {
    //     const earliestDateIfAny = new HappensDateField().earliestDate(task);
    //     return [Group.stringFromDate(earliestDateIfAny, 'happens')];
    // }

    private static stringFromDate(
        date: moment.Moment | null,
        field: string,
    ): string {
        if (date == null) {
            return 'No ' + field + ' date';
        }
        return date.format(Group.groupDateFormat);
    }

    // private static groupByPath(task: Task): string[] {
    //     // Does this need to be made stricter?
    //     // Is there a better way of getting the file name?
    //     return [task.path.replace('.md', '')];
    // }

    // private static groupByFolder(task: Task): string[] {
    //     const path = task.path;
    //     const fileNameWithExtension = task.filename + '.md';
    //     const folder = path.substring(
    //         0,
    //         path.lastIndexOf(fileNameWithExtension),
    //     );
    //     if (folder === '') {
    //         return ['/'];
    //     }
    //     return [folder];
    // }

    // private static groupByFileName(task: Task): string[] {
    //     // Note current limitation: Tasks from different notes with the
    //     // same name will be grouped together, even though they are in
    //     // different files and their links will look different.
    //     const filename = task.filename;
    //     if (filename === null) {
    //         return ['Unknown Location'];
    //     }
    //     return [filename];
    // }

    // private static groupByRoot(task: Task): string[] {
    //     const path = task.path.replace(/\\/g, '/');
    //     const separatorIndex = path.indexOf('/');
    //     if (separatorIndex == -1) {
    //         return ['/'];
    //     }
    //     return [path.substring(0, separatorIndex + 1)];
    // }

    // private static groupByBacklink(task: Task): string[] {
    //     const linkText = task.getLinkText({ isFilenameUnique: true });
    //     if (linkText === null) {
    //         return ['Unknown Location'];
    //     }
    //     return [linkText];
    // }

    private static groupByCompleted(task: Task): string[] {
        if (task.completed) {
            return ['Completed']
        } else {
            return ['Not completed']
        }
    }

    // private static groupByHeading(task: Task): string[] {
    //     if (
    //         task.precedingHeader === null ||
    //         task.precedingHeader.length === 0
    //     ) {
    //         return ['(No heading)'];
    //     }
    //     return [task.precedingHeader];
    // }

    private static groupByTags(task: Task): string[] {
        if (task.tags.length == 0) {
            return ['(No tags)'];
        }
        return task.tags;
    }
}
