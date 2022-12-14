// Reproduced from: https://github.com/obsidian-tasks-group/obsidian-tasks
import type { Moment } from 'moment';
import { Task } from '../../FileInterface';
import { DateField } from './DateField';

/**
 * Support the 'done' search instruction.
 */
export class DoneDateField extends DateField {
    private static readonly doneRegexp = /^done (before|after|on)? ?(.*)/;

    protected filterRegexp(): RegExp {
        return DoneDateField.doneRegexp;
    }
    protected fieldName(): string {
        return 'done';
    }
    protected date(task: Task): Moment | null {
        return task.doneDate;
    }
    protected filterResultIfFieldMissing() {
        return false;
    }
}
