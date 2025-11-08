import { BrowserWindow, ipcMain } from 'electron'
import mitt from 'mitt'
import { MAIN_EVENTS, RENDERER_EVENTS, THREAD, type IpcMsgBody } from './events'

const emitter = mitt()

ipcMain.on('renderer-message', (event: Electron.IpcMainEvent, msgBody: IpcMsgBody) => {
  emitter.emit(msgBody.type, { event, data: msgBody.data })
})

const invokeHandlers: Map<string, (data?: any) => any> = new Map()

ipcMain.handle(
  'renderer-message',
  async (event: Electron.IpcMainInvokeEvent, msgBody: IpcMsgBody) => {
    const getter = invokeHandlers.get(msgBody.type)
    if (getter) {
      const data = getter({ event, data: msgBody.data })
      return data instanceof Promise ? await data : data
    }
  }
)

export default {
  get all() {
    return emitter.all
  },
  on: (type: RENDERER_EVENTS, handler: (data?: any) => void) => emitter.on(type, handler),
  off: (type: RENDERER_EVENTS, handler?: (data?: any) => void) => emitter.off(type, handler),
  emit: (type: MAIN_EVENTS, data?: any) => {
    BrowserWindow.getAllWindows().forEach((win) => {
      win.webContents.send('main-message', {
        thread: THREAD.MAIN,
        type,
        data
      })
    })
  },
  handle: (type: RENDERER_EVENTS, getter: (data?: any) => any) => {
    invokeHandlers.set(type, getter)
  }
}
