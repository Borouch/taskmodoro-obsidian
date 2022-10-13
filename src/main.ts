/* eslint-disable linebreak-style */
/* eslint-disable simple-import-sort/sort */
import {
    MarkdownPostProcessorContext,
    MarkdownView,
    Notice,
    Plugin,
    PluginSettingTab,
    Setting,
} from 'obsidian';
import { writable } from 'svelte/store';
import { FileInterface, Task } from './FileInterface';
import { ISettings, settingsWithDefaults } from './Settings';

import { Query } from './Query';
import QueryRenderChild from './QueryRenderChild';
import QueryTasksList from './UI/QueryTasksList.svelte';
import SubtasksExpandedState from './Stores/SubtasksExpansionRecord';
import { TaskCache } from './Stores/TaskCache';
import { TaskDetails } from './TaskDetails';
import { TaskDetailsModal } from './Modals';
import { TaskDetailsMode } from './Enums/component-context';
import { TaskDetailsNavigation } from './Stores/TaskNavigationRecord';
import { TimerTaskView } from './TimerTaskView';
import { VIEW_TYPE_POMODORO_TASK as VIEW_TYPE_TIMER_TASK } from './Helpers/Constants';

export default class TQPlugin extends Plugin {
    public settings: ISettings;
    public fileInterface: FileInterface;
    public taskCache: TaskCache;
    public taskNav: TaskDetailsNavigation;
    public expState: SubtasksExpandedState;
    public async onload(): Promise<void> {
        console.log('taskmodoro: Loading plugin' + this.manifest.version);

        await this.loadSettings();
        this.addSettingTab(new SettingsTab(this));

        this.fileInterface = new FileInterface(this, this.app);
        this.taskCache = new TaskCache(this, this.app);
        this.taskNav = new TaskDetailsNavigation();
        this.expState = new SubtasksExpandedState();
        this.registerView(
            VIEW_TYPE_TIMER_TASK,
            (leaf) => new TimerTaskView(leaf, this),
        );

        this.addRibbonIcon('checkbox-glyph', 'taskmodoro', () => {
            new TaskDetailsModal(this, TaskDetailsMode.Create).open();
        });


        // TODO: If triggered from a daily note, use that as the due date default
        this.addCommand({
            id: 'create-task-modal',
            name: 'Create Task',
            callback: () => {
                new TaskDetailsModal(this, TaskDetailsMode.Create).open();
            },
        });

        this.registerEvent(
            this.app.vault.on('rename', (afile, oldPath) => {
                if (oldPath.startsWith(this.settings.TasksDir)) {
                    this.taskCache.handleTaskDeleted(oldPath);
                    const file = this.app.metadataCache.getFirstLinkpathDest(
                        afile.path,
                        '/',
                    );
                    if (file) {
                        this.taskCache.handleTaskModified(file);
                    }
                }
            }),
        );

        this.registerEvent(
            this.app.vault.on('create', (file) => {
                if (file.path.startsWith(this.settings.TasksDir)) {
                    this.fileInterface.handleTaskModified(file);
                    // console.log('onCreate');
                }
            }),
        );

        this.registerEvent(
            this.app.vault.on('modify', (file) => {
                if (file.path.startsWith(this.settings.TasksDir)) {
                    this.fileInterface.handleTaskModified(file);
                    // console.log('onModify');
                }
            }),
        );

        this.registerEvent(
            this.app.metadataCache.on('changed', (file) => {
                if (file.path.startsWith(this.settings.TasksDir)) {
                    this.taskCache.handleTaskModified(file);
                    // console.log('onChanged');
                }
            }),
        );

        this.registerEvent(
            this.app.metadataCache.on('resolve', (file) => {
                if (file.path.startsWith(this.settings.TasksDir)) {
                    this.taskCache.handleTaskModified(file);
                    // console.log('onResolve');
                }
            }),
        );

        this.registerEvent(
            this.app.vault.on('delete', (file) => {
                if (file.path.startsWith(this.settings.TasksDir)) {
                    this.taskCache.handleTaskDeleted(file.path);
                }
            }),
        );

        this.registerMarkdownCodeBlockProcessor(
            'taskmodoro',
            (
                source: string,
                el: HTMLElement,
                ctx: MarkdownPostProcessorContext,
            ) => {
                ctx.addChild(new QueryRenderChild(this, el, source));
            },
        );

        // this.registerObsidianProtocolHandler('taskmodoro', async params => {
        //   if (!params.create) {
        //     console.debug('taskmodoro: Unknown URL request')
        //     console.debug(params)
        //     return
        //   }

        //   if (!params.task) {
        //     new Notice('Cannot create a task with no "task" property')
        //     return
        //   }
        //   await this.fileInterface.storeNestedTasks(
        //     params.taskName,
        //     params.description,
        //     params.due,
        //     params.scheduled,
        //     params.recurrence,
        //     params.tags ? params.tags.split(',') : [],
        //   )

        //   new Notice('Task created')
        // })
    }
    public onunload(): void {
        this.app.workspace.detachLeavesOfType(VIEW_TYPE_TIMER_TASK);
    }

    public async activatePomodoroTaskView(td: TaskDetails): Promise<void> {
        if (
            this.app.workspace.getLeavesOfType(VIEW_TYPE_TIMER_TASK).length ===
            0
        ) {
            await this.app.workspace.getRightLeaf(false).setViewState({
                type: VIEW_TYPE_TIMER_TASK,
                active: true,
            });
        }

        const timerTaskLeaf =
            this.app.workspace.getLeavesOfType(VIEW_TYPE_TIMER_TASK)[0];
        const timerTaskView = timerTaskLeaf.view as TimerTaskView;
        timerTaskView.td = td;
        await timerTaskView.onOpen();

        this.app.workspace.revealLeaf(
            this.app.workspace.getLeavesOfType(VIEW_TYPE_TIMER_TASK)[0],
        );
    }

    private async loadSettings(): Promise<void> {
        this.settings = settingsWithDefaults(await this.loadData());
    }
}

class SettingsTab extends PluginSettingTab {
    private readonly plugin: TQPlugin;

    constructor(plugin: TQPlugin) {
        super(plugin.app, plugin);
        this.plugin = plugin;
    }

    public display(): void {
        const { containerEl } = this;
        containerEl.empty();

        containerEl.createEl('h2', { text: 'taskmodoro Plugin - Settings' });

        this.addDefaultTaskDir(new Setting(containerEl));
        this.addRootTaskDefaultTag(new Setting(containerEl));
    }

    public onunload(): void {
        this.app.workspace.detachLeavesOfType(VIEW_TYPE_TIMER_TASK);
    }

    private readonly addRootTaskDefaultTag = (setting: Setting): void => {
        setting
            .setName('Root tasks tags')
            .setDesc(
                'Tags that will be included in all root (without parent) tasks',
            )
            .addText((text) => {
                text.setPlaceholder('#tag1 #tag2').setValue(
                    this.plugin.settings.RootTasksTags,
                );
                text.inputEl.onblur = (e: FocusEvent) => {
                    this.plugin.settings.RootTasksTags = (
                        e.target as HTMLInputElement
                    ).value;
                    this.plugin.saveData(this.plugin.settings);
                };
            });
    };

    private readonly addDefaultTaskDir = (setting: Setting): void => {
        setting
            .setName('Tasks Directory')
            .setDesc('The vault directory in which to store task files')
            .addText((text) => {
                text.setPlaceholder('$').setValue(
                    this.plugin.settings.TasksDir,
                );
                text.inputEl.onblur = (e: FocusEvent) => {
                    this.plugin.settings.TasksDir = (
                        e.target as HTMLInputElement
                    ).value;
                    this.plugin.saveData(this.plugin.settings);
                };
            });
    };
}

// const createDonateButton = (link: string, img: HTMLElement): HTMLElement => {
//   const a = document.createElement('a')
//   a.setAttribute('href', link)
//   a.addClass('taskmodoro-donate-button')
//   a.appendChild(img)
//   return a
// }
