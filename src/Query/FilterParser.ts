import { BooleanField } from './Filter/BooleanField';
import { StatusField } from './Filter/StatusField';
import { DescriptionField } from './Filter/DescriptionField';
import { DoneDateField } from './Filter/DoneDateField';
import { DueDateField } from './Filter/DueDateField';
import { ExcludeSubtasksField } from './Filter/ExcludeSubItemsField';
import type { FilterOrErrorMessage } from './Filter/Filter';
import { HappensDateField } from './Filter/HappensDateField';
import { HeadingField } from './Filter/HeadingField';
import { PathField } from './Filter/PathField';
import { PriorityField } from './Filter/PriorityField';
import { RecurringField } from './Filter/RecurringField';
import { ScheduledDateField } from './Filter/ScheduledDateField';
import { StartDateField } from './Filter/StartDateField';
import { TagsField } from './Filter/TagsField';

// Reproduced from: https://github.com/obsidian-tasks-group/obsidian-tasks

const fieldCreators = [
    () => new StatusField(),
    () => new RecurringField(),
    // () => new PriorityField(),
    // () => new HappensDateField(),
    // () => new StartDateField(),
    () => new ScheduledDateField(),
    () => new DueDateField(),
    // () => new DoneDateField(),
    () => new DescriptionField(),
    () => new TagsField(),
    () => new ExcludeSubtasksField(),
    () => new BooleanField(),
];

export const parseFilter = (
    filterString: string,
): FilterOrErrorMessage | null => {
    for (const creator of fieldCreators) {
        const field = creator();
        if (field.canCreateFilterForLine(filterString)) {
            return field.createFilterOrErrorMessage(filterString);
        }
    }
    return null;
};
