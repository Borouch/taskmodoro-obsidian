import { FileInterface, Task } from './file-interface'
import { TaskCache } from "./stores/TaskCache"
import { buyMeACoffee, paypal } from './graphics'
import { convertLegacyTask } from './legacy-parser'
import { TaskDetailsModal } from './modals'
import { ISettings, settingsWithDefaults } from './settings'
import { stateFromConfig } from './state'
import TasksList from './ui/QueryTasksList.svelte'
import { VIEW_TYPE_POMODORO_TASK as VIEW_TYPE_TIMER_TASK } from './helpers/constants'
import {
  MarkdownPostProcessorContext,
  MarkdownView,
  Notice,
  Plugin,
  PluginSettingTab,
  Setting,
} from 'obsidian'
import { writable } from 'svelte/store'
import { TimerTaskView } from './timer-task-view'
import type { Duration } from 'moment'
import { TaskDetailsMode } from './enums/component-context'
import type { TaskDetails } from './task-details';
import { TaskDetailsNavigation } from './stores/TaskNavigationRecord';

export default class TQPlugin extends Plugin {
  public settings: ISettings
  public fileInterface: FileInterface
  public taskCache: TaskCache
  public taskNav: TaskDetailsNavigation

  public async onload (): Promise<void> {
    console.log('tq: Loading plugin' + this.manifest.version)

    await this.loadSettings()
    this.addSettingTab(new SettingsTab(this))

    this.fileInterface = new FileInterface(this, this.app)
    this.taskCache = new TaskCache(this, this.app)
    this.taskNav = new TaskDetailsNavigation(this)
    
    this.registerView(
      VIEW_TYPE_TIMER_TASK,
      leaf => new TimerTaskView(leaf, this),
    )

    this.addRibbonIcon('checkbox-glyph', 'tq', () => {
      new TaskDetailsModal(this,TaskDetailsMode.Create).open()
    })

    // TODO: If triggered from a daily note, use that as the due date default
    this.addCommand({
      id: 'create-task-modal',
      name: 'Create Task',
      callback: () => {
        new TaskDetailsModal(this,TaskDetailsMode.Create).open()
      },
    })

    this.addCommand({
      id: 'convert-task',
      name: 'Convert Task',
      checkCallback: (checking: boolean): boolean | void => {
        const activeLeaf = this.app.workspace.getActiveViewOfType(MarkdownView)
        if (!activeLeaf) {
          return false
        }
        return convertLegacyTask(checking, activeLeaf, this.fileInterface)
      },
    })

    this.registerEvent(
      this.app.vault.on('rename', (afile, oldPath) => {
        if (oldPath.startsWith(this.settings.TasksDir)) {
          this.taskCache.handleTaskDeleted(oldPath)
          const file = this.app.metadataCache.getFirstLinkpathDest(
            afile.path,
            '/',
          )
          if (file) {
            this.taskCache.handleTaskModified(file)
          }
        }
      }),
    )

    this.registerEvent(
      this.app.vault.on('create', file => {
        if (file.path.startsWith(this.settings.TasksDir)) {
          this.fileInterface.handleTaskModified(file)
        }
      }),
    )

    this.registerEvent(
      this.app.vault.on('modify', file => {
        if (file.path.startsWith(this.settings.TasksDir)) {
          this.fileInterface.handleTaskModified(file)
        }
      }),
    )

    this.registerEvent(
      this.app.metadataCache.on('changed', file => {
        if (file.path.startsWith(this.settings.TasksDir)) {
          this.taskCache.handleTaskModified(file)
        }
      }),
    )
    this.registerEvent(
      this.app.metadataCache.on('resolve', file => {
        if (file.path.startsWith(this.settings.TasksDir)) {
          this.taskCache.handleTaskModified(file)
        }
      }),
    )

    this.registerEvent(
      this.app.vault.on('delete', file => {
        if (file.path.startsWith(this.settings.TasksDir)) {
          this.taskCache.handleTaskDeleted(file.path)
        }
      }),
    )

    this.registerMarkdownCodeBlockProcessor(
      'tq',
      this.markdownCodeBlockProcessor,
    )

    this.registerObsidianProtocolHandler('tq', async params => {
      if (!params.create) {
        console.debug('tq: Unknown URL request')
        console.debug(params)
        return
      }

      if (!params.task) {
        new Notice('Cannot create a task with no "task" property')
        return
      }
      await this.fileInterface.storeNestedTasks(
        params.taskName,
        params.description,
        params.due,
        params.scheduled,
        params.repeat,
        params.tags ? params.tags.split(',') : [],
      )

      new Notice('Task created')
    })
  }
  onunload () {
    this.app.workspace.detachLeavesOfType(VIEW_TYPE_TIMER_TASK)
  }

  async activatePomodoroTaskView (td: TaskDetails, duration: Duration) {

    if (
      this.app.workspace.getLeavesOfType(VIEW_TYPE_TIMER_TASK).length === 0
    ) {
      await this.app.workspace.getRightLeaf(false).setViewState({
        type: VIEW_TYPE_TIMER_TASK,
        active: true,
      })
    }

    let timerTaskLeaf = this.app.workspace.getLeavesOfType(
      VIEW_TYPE_TIMER_TASK,
    )[0]
    let timerTaskView = timerTaskLeaf.view as TimerTaskView
    timerTaskView.td = td
    await timerTaskView.onOpen()
    
    this.app.workspace.revealLeaf(
      this.app.workspace.getLeavesOfType(VIEW_TYPE_TIMER_TASK)[0],
    )
  }

  private async loadSettings (): Promise<void> {
    this.settings = settingsWithDefaults(await this.loadData())
  }

  private readonly markdownCodeBlockProcessor = (
    source: string,
    el: HTMLElement,
    ctx: MarkdownPostProcessorContext,
  ): void => {
    new TasksList({
      target: el,
      props: {
        plugin: this,
        view: null,
        state: writable(stateFromConfig(source.split('\n'))),
      },
    })
  }
}

class SettingsTab extends PluginSettingTab {
  private readonly plugin: TQPlugin

  constructor (plugin: TQPlugin) {
    super(plugin.app, plugin)
    this.plugin = plugin
  }

  public display (): void {
    const { containerEl } = this
    containerEl.empty()

    containerEl.createEl('h2', { text: 'tq Plugin - Settings' })

    new Setting(containerEl)
      .setName('Tasks Directory')
      .setDesc('The vault directory in which to store task files')
      .addText(text => {
        text.setPlaceholder('$').setValue(this.plugin.settings.TasksDir)
        text.inputEl.onblur = (e: FocusEvent) => {
          this.plugin.settings.TasksDir = (e.target as HTMLInputElement).value
          this.plugin.saveData(this.plugin.settings)
        }
      })

    const div = containerEl.createEl('div', {
      cls: 'tq-donation',
    })

    const donateText = document.createElement('p')
    donateText.appendText(
      'If this plugin adds value for you and you would like to help support ' +
        'continued development, please use the buttons below:',
    )
    div.appendChild(donateText)

    const parser = new DOMParser()

    div.appendChild(
      createDonateButton(
        'https://paypal.me/tgrosinger',
        parser.parseFromString(paypal, 'text/xml').documentElement,
      ),
    )

    div.appendChild(
      createDonateButton(
        'https://www.buymeacoffee.com/tgrosinger',
        parser.parseFromString(buyMeACoffee, 'text/xml').documentElement,
      ),
    )
  }
  onunload () {
    this.app.workspace.detachLeavesOfType(VIEW_TYPE_TIMER_TASK)
  }
}

const createDonateButton = (link: string, img: HTMLElement): HTMLElement => {
  const a = document.createElement('a')
  a.setAttribute('href', link)
  a.addClass('tq-donate-button')
  a.appendChild(img)
  return a
}
