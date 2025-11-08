import mitt from 'mitt'

export enum PAGE_EVENT {
  SETTINGS_INITED = 'settings-inited',
  SETTING_CHANGED = 'setting-changed',
  SHOW_SETTINGS = 'open-settings'
}

export const emitter = mitt<any>()
