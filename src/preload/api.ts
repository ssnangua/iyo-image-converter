import sharpExtra from '@ssnangua/sharp-extra'
import { getFilesInfo, getImageFiles } from '../common/file'
import { type Task } from '../worker/task'
import ipc from '../ipc/renderer'
import { RENDERER_EVENTS } from '../ipc/events'

// Custom APIs for renderer
const api = {
  getFilesInfo,
  getImageFiles,
  getImageInfo(file: string): Promise<sharpExtra.ImageInfo> {
    return ipc.invoke(RENDERER_EVENTS.GET_IMAGE_INFO, file)
  },
  showOpenDialog(options: Electron.OpenDialogOptions): Promise<Electron.OpenDialogReturnValue> {
    return ipc.invoke(RENDERER_EVENTS.SHOW_OPEN_DIALOG, options)
  },
  startCovert(tasks: Task[]) {
    ipc.emit(RENDERER_EVENTS.START_CONVERT, tasks)
  },
  stopCovert() {
    ipc.emit(RENDERER_EVENTS.STOP_CONVERT)
  }
}

export default api
