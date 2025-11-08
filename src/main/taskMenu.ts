import { BrowserWindow, Menu, type MenuItemConstructorOptions } from 'electron'
import ipc from '../ipc/main'
import { type Task } from '../worker/task'
import { TYPES } from '../common/format'
import { MAIN_EVENTS } from '../ipc/events'

function callback(this: Electron.WebContents, action: string, type?: string) {
  ipc.emit(MAIN_EVENTS.TASKS_MENU_CALLBACK, { action, type })
}

export function createTasksMenu(event: Electron.IpcMainEvent, _: Task[]) {
  const cb = callback.bind(event.sender)
  const template: MenuItemConstructorOptions[] = [
    {
      label: '移除任务',
      accelerator: 'Delete',
      click: () => cb('remove')
    },
    {
      label: '重置任务',
      accelerator: 'CmdOrCtrl+R',
      click: () => cb('reset')
    },
    {
      label: '清空列表',
      click: () => cb('clear')
    },
    { type: 'separator' },
    {
      label: '转换为',
      submenu: TYPES.map((type) => ({
        label: type.label,
        click: () => cb('type', type.key)
      }))
    },
    { type: 'separator' },
    {
      label: '全选',
      accelerator: 'CmdOrCtrl+A',
      click: () => cb('select-all')
    },
    {
      label: '反选',
      click: () => cb('invert-selection')
    }
  ]

  const menu = Menu.buildFromTemplate(template)
  menu.popup({ window: BrowserWindow.fromWebContents(event.sender)! })
}
