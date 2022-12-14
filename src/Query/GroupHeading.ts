// Reproduced from: https://github.com/obsidian-tasks-group/obsidian-tasks

/**
 * GroupHeading contains the data needed to render one heading for a group of tasks
 */
export class GroupHeading {
    /**
     * How nested the heading is.
     * 0 is the first group, meaning this heading was generated by
     * the first 'group by' instruction.
     */
    public readonly nestingLevel: number;

    /**
     * The text to be displayed for the group.
     */
    public readonly name: string;

    /**
     * Construct a GroupHeading object
     * @param {number} nestingLevel - See this.nestingLevel for details
     * @param {string} name - The text to be displayed for the group
     */
    constructor(nestingLevel: number, name: string) {
        this.nestingLevel = nestingLevel;
        this.name = name;
    }
}
