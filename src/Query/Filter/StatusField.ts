// Reproduced from: https://github.com/obsidian-tasks-group/obsidian-tasks
import type { Task } from '../../FileInterface';
import { FilterInstructionsBasedField } from './FilterInstructionsBasedField';

export class StatusField extends FilterInstructionsBasedField {
    constructor() {
        super();

        this._filters.add('completed', (task: Task) => task.status !== 'uncompleted');
        this._filters.add('done', (task: Task) => task.status === 'done');
        this._filters.add('failed', (task: Task) => task.status === 'failed');
        this._filters.add('not completed', (task: Task) => task.status === 'uncompleted');
        this._filters.add('not done', (task: Task) => task.status !== 'done');
        this._filters.add('not failed', (task: Task) => task.status !== 'failed');
    }

    protected fieldName(): string {
        return 'status';
    }
}
