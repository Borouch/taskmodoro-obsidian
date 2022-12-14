// Reproduced from: https://github.com/obsidian-tasks-group/obsidian-tasks
import { FilterInstructionsBasedField } from './FilterInstructionsBasedField';

export class RecurringField extends FilterInstructionsBasedField {
    constructor() {
        super();
        this._filters.add('is recurring', (task) => task.recurrence !== null);
        this._filters.add(
            'is not recurring',
            (task) => task.recurrence === null,
        );
    }

    protected fieldName(): string {
        return 'recurring';
    }
}
