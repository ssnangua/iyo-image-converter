import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { cloneDeep, merge, isEqual } from 'lodash-es'
import { emitter, PAGE_EVENT } from '../common/bus'
import { RENDERER_EVENTS } from '@ipc/events'
import { getDefaultSettings, type Settings } from '@settings/Settings'

const defaultSettings = getDefaultSettings()
const initialSettings = cloneDeep(defaultSettings)

export const useSettingsStore = create<Settings>()(immer(() => cloneDeep(initialSettings)))

export function diff(oldValue: object, newValue: object) {
  const changed = {}
  for (let key in newValue) {
    if (oldValue[key] !== newValue[key]) {
      changed[key] = newValue[key]
    }
  }
  return changed
}

export function getSetting(key: string) {
  return useSettingsStore.getState()[key]
}

export function setSetting(key: string, value: any) {
  const oldValue = useSettingsStore.getState()[key]
  if (isEqual(oldValue, merge({}, oldValue, value))) return
  useSettingsStore.setState((state) => {
    Object.assign(state[key], diff(state[key], value))
  })
  emitter.emit(PAGE_EVENT.SETTING_CHANGED, { key, data: getSetting(key) })
}

function resetSettings(isDefault = false, key?: string) {
  const settings = isDefault ? defaultSettings : initialSettings
  if (key) {
    const currentSettings = useSettingsStore.getState()
    if (isEqual(currentSettings[key], settings[key])) return
    useSettingsStore.setState((state) => {
      Object.assign(state[key], diff(state[key], settings[key]))
    })
    emitter.emit(PAGE_EVENT.SETTING_CHANGED, { key, data: settings[key] })
  } else {
    const currentSettings = useSettingsStore.getState()
    for (let key in settings) {
      if (isEqual(currentSettings[key], settings[key])) continue
      useSettingsStore.setState((state) => {
        Object.assign(state[key], diff(state[key], settings[key]))
      })
      emitter.emit(PAGE_EVENT.SETTING_CHANGED, { key, data: settings[key] })
    }
  }
}

export function resetSettingsToDefault(key?: string) {
  resetSettings(true, key)
}

export function resetSettingsToInitial(key?: string) {
  resetSettings(false, key)
}

export function saveSettings() {
  const currentSettings = useSettingsStore.getState()
  merge(initialSettings, currentSettings)
  window.ipc.emit(RENDERER_EVENTS.SAVE_SETTINGS, currentSettings)
}

;(async function getLocalSettings() {
  const localSettings = await window.ipc.invoke(RENDERER_EVENTS.GET_SETTINGS)
  if (!localSettings) return
  merge(initialSettings, localSettings)
  const currentSettings = useSettingsStore.getState()
  for (let key in initialSettings) {
    if (isEqual(currentSettings[key], initialSettings[key])) continue
    useSettingsStore.setState((state) => {
      Object.assign(state[key], diff(state[key], initialSettings[key]))
    })
  }
  emitter.emit(PAGE_EVENT.SETTINGS_INITED, initialSettings)
})()
