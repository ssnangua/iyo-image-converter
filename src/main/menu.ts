import os from 'node:os'
import { app, BrowserWindow, dialog, Menu, shell, type MenuItemConstructorOptions } from 'electron'
import ipc from '../ipc/main'
import { MAIN_EVENTS } from '../ipc/events'

// const isMac = process.platform === 'darwin'

export function createMenu() {
  const template: MenuItemConstructorOptions[] = [
    {
      label: '文件',
      submenu: [
        {
          label: '选项',
          accelerator: 'F5',
          click() {
            ipc.emit(MAIN_EVENTS.SHOW_SETTINGS)
          }
        },
        { type: 'separator' },
        {
          label: '退出',
          accelerator: 'CmdOrCtrl+Q',
          role: 'quit'
        }
      ]
    },
    {
      label: '帮助',
      submenu: [
        {
          label: '主页',
          click() {
            shell.openExternal('https://github.com/ssnangua/iyo-image-converter/tree/v2')
          }
        },
        { type: 'separator' },
        { label: '开发者工具', role: 'toggleDevTools' },
        { type: 'separator' },
        {
          label: '关于',
          click() {
            dialog.showMessageBox(BrowserWindow.getFocusedWindow()!, {
              title: '哎哟图片转换器',
              type: 'info',
              message: '哎哟图片转换器',
              detail: [
                `版本：${app.getVersion()}`,
                `Electron：${process.versions.electron}`,
                `Chromium：${process.versions.chrome}`,
                `Node.js：${process.versions.node}`,
                `V8：${process.versions.v8}`,
                `OS：${os.type()} ${os.arch()} ${os.release()}`
              ].join('\n'),
              buttons: ['确定'],
              noLink: true
            })
          }
        }
      ]
    }
  ]

  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
}
