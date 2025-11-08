import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { useSettingsStore } from './settingsStore'
import { WORKER_EVENTS } from '@ipc/events'

interface GlobalStore {
  type: string
  hoverType: string
  isProcessing: boolean
}

export const useGlobalStore = create<GlobalStore>()(
  immer(() => ({
    type: 'TINY',
    hoverType: '',
    isProcessing: false as boolean
  }))
)

export function setType(type: string) {
  useGlobalStore.setState((state) => {
    state.type = type
  })
}

export function setHoverType(type: string) {
  useGlobalStore.setState((state) => {
    state.hoverType = type
  })
}

export function setIsProcessing(isProcessing: boolean) {
  useGlobalStore.setState((state) => {
    state.isProcessing = isProcessing
  })
}

window.ipc.on(WORKER_EVENTS.CONVERT_COMPLETE, () => {
  setIsProcessing(false)
  const completeNotify = useSettingsStore.getState().General.completeNotify
  if (completeNotify) window.shell.beep()
})
