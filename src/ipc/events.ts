export interface IpcMsgBody {
  thread: 'main' | 'worker' | 'renderer'
  type: string
  data?: any
  error?: any
  // event?: Electron.IpcMainEvent | Electron.IpcMainInvokeEvent | Electron.IpcRendererEvent
}

export enum THREAD {
  MAIN = 'main',
  WORKER = 'worker',
  RENDERER = 'renderer'
}

export enum MAIN_EVENTS {
  SHOW_SETTINGS = 'show-settings',
  SETTING_CHANGED = 'settings-changed',
  TASKS_MENU_CALLBACK = 'tasks-menu-callback'
}

export enum RENDERER_EVENTS {
  GET_SHARP_CONCURRENCY = 'get-sharp-concurrency',
  GET_SETTINGS = 'read-settings',
  SAVE_SETTINGS = 'write-settings',
  START_CONVERT = 'start-convert',
  STOP_CONVERT = 'stop-convert',
  SHOW_OPEN_DIALOG = 'show-open-dialog',
  GET_IMAGE_INFO = 'get-image-info',
  SHOW_TASKS_MENU = 'show-tasks-menu'
}

export enum WORKER_EVENTS {
  TASK_STATE_CHANGED = 'task-state-changed',
  CONVERT_COMPLETE = 'convert-complete'
}
