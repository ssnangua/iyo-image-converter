import { ipcRenderer } from 'electron'
import { MAIN_EVENTS, RENDERER_EVENTS, THREAD, type IpcMsgBody } from './events'
import mitt from 'mitt'

const emitter = mitt()

ipcRenderer.on('main-message', (_: Electron.IpcRendererEvent, msgBody: IpcMsgBody) => {
  emitter.emit(msgBody.type, msgBody.data)
})

export default {
  get all() {
    return emitter.all
  },
  on: (type: MAIN_EVENTS, handler: (data?: any) => void) => emitter.on(type, handler),
  off: (type: MAIN_EVENTS, handler?: (data?: any) => void) => emitter.off(type, handler),
  emit: (type: RENDERER_EVENTS, data?: any) => {
    ipcRenderer.send('renderer-message', {
      thread: THREAD.RENDERER,
      type,
      data
    })
  },
  invoke: (type: RENDERER_EVENTS, data?: any): Promise<any> => {
    return ipcRenderer.invoke('renderer-message', {
      thread: THREAD.RENDERER,
      type,
      data
    })
  }
}
