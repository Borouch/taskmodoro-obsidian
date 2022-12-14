import { Task } from '../FileInterface';
import type { GroupHeading } from './GroupHeading';

// Reproduced from: https://github.com/obsidian-tasks-group/obsidian-tasks

/**
 * TaskGroup stores a single group of tasks, that all share the same group names.
 * TaskGroup objects are stored in a TaskGroups object.
 *
 * For example, if the user supplied these 'group by' lines:
 *   group by folder
 *   group by filename
 *   group by heading
 * Then the names of one TaskGroup might be this:
 *   Some/Folder/In/The/Vault
 *   A Particular File Name
 *   My lovely heading
 * And the TaskGroup would store all the tasks from that location
 * that match the task block's filters, in the task block's sort order
 */
export class TaskGroup {
    /**
     * The names of the group properties for this set of tasks,
     * in the order of the 'group by' lines the user specified
     */
    public readonly groups: string[];

    /**
     * The headings to be displayed in front of this set of tasks,
     * when rendering the results.
     *
     * It only contains the minimal set of headings required to separate
     * this group of tasks from the previous group of tasks.
     *
     * If there were no 'group by' instructions in the tasks code block,
     * this will be empty.
     */
    public readonly groupHeadings: GroupHeading[];

    /**
     * All the tasks that match the user's filters and that have the
     * group names exactly matching groups().
     */
    public readonly tasks: Task[];

    /**
     * Constructor for TaskGroup
     * @param {string[]} groups - See this.groups for details
     * @param {GroupHeading[]} groupHeadings - See this.groupHeadings for details
     * @param tasks {Task[]} - See this.tasks for details
     */
    constructor(
        groups: string[],
        groupHeadings: GroupHeading[],
        tasks: Task[],
    ) {
        this.groups = groups;
        this.groupHeadings = groupHeadings;
        this.tasks = tasks;
    }

    // /**
    //  * A markdown-format representation of all the tasks in this group.
    //  *
    //  * Useful for testing.
    //  */
    // public tasksAsStringOfLines(): string {
    //     let output = '';
    //     for (const task of this.tasks) {
    //         output += task.toFileLineString() + '\n';
    //     }
    //     return output;
    // }

    // /**
    //  * A human-readable representation of this task group, including names
    //  * and headings that should be displayed.
    //  *
    //  * Note that this is used in snapshot testing, so if the format is
    //  * changed, the snapshots will need to be updated.
    //  */
    // public toString(): string {
    //     let output = '\n';
    //     output += `Group names: [${this.groups}]\n`;

    //     for (const heading of this.groupHeadings) {
    //         // These headings mimic the behaviour of QueryRenderer,
    //         // which uses 'h4', 'h5' and 'h6' for nested groups.
    //         const headingPrefix = '#'.repeat(4 + heading.nestingLevel);
    //         output += `${headingPrefix} ${heading.name}\n`;
    //     }

    //     output += this.tasksAsStringOfLines();
    //     return output;
    // }
}
