export interface ISettings {
  TasksDir: string;
  RootTasksTags: string;
}

const defaultSettings: ISettings = {
  TasksDir: 'tasks',
  RootTasksTags: '',
};

export const settingsWithDefaults = (
  settings: Partial<ISettings>,
): ISettings => ({ ...defaultSettings, ...settings });
