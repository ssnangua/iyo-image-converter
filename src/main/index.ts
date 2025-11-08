import fs from 'node:fs'
import { app, shell, BrowserWindow, dialog } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { createMenu } from './menu'
import icon from '../../resources/icon.png?asset'
import { getSharpConcurrency, getSettings, saveSettings } from '../settings'
import sharpExtra from '@ssnangua/sharp-extra'
import ipc from '../ipc/main'
import { RENDERER_EVENTS, WORKER_EVENTS, type IpcMsgBody } from '../ipc/events'

import type { Worker } from 'node:worker_threads'
import createWorker from '../worker?nodeWorker'
import { createTasksMenu } from './taskMenu'

const isDev = process.env.NODE_ENV === 'development'
let mainWindow: BrowserWindow
let worker: Worker

function getWorker() {
  if (!worker) {
    worker = createWorker({ workerData: 'worker' })

    worker.on('message', async (msgBody: IpcMsgBody) => {
      if (msgBody.type === WORKER_EVENTS.TASK_STATE_CHANGED && msgBody.data?.state === 'done') {
        const task = msgBody.data
        if (task.generalOptions.afterProcessing === 'moveSourceFileToTrash') {
          await shell.trashItem(task.input.path)
          task.input.exists = false
        } else if (task.generalOptions.afterProcessing === 'deleteSourceFile') {
          await fs.promises.rm(task.input.path)
          task.input.exists = false
        }
      }
      mainWindow.webContents.send('main-message', msgBody)
    })
  }
  return worker
}

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    minWidth: 720,
    minHeight: 500,
    show: false,
    autoHideMenuBar: false,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.mjs'),
      webSecurity: !isDev,
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
    if (isDev) mainWindow.webContents.openDevTools()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('iyo-image-converter')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC
  ipc.on(RENDERER_EVENTS.SAVE_SETTINGS, ({ data }) => saveSettings(data))
  ipc.on(RENDERER_EVENTS.START_CONVERT, ({ data }) =>
    getWorker().postMessage({ type: RENDERER_EVENTS.START_CONVERT, data })
  )
  ipc.on(RENDERER_EVENTS.STOP_CONVERT, ({ data }) =>
    getWorker().postMessage({ type: RENDERER_EVENTS.STOP_CONVERT, data })
  )
  ipc.on(RENDERER_EVENTS.SHOW_TASKS_MENU, ({ event, data }) => createTasksMenu(event, data))

  ipc.handle(RENDERER_EVENTS.GET_SHARP_CONCURRENCY, () => getSharpConcurrency())
  ipc.handle(RENDERER_EVENTS.GET_SETTINGS, () => getSettings())
  ipc.handle(RENDERER_EVENTS.SHOW_OPEN_DIALOG, ({ data }) => dialog.showOpenDialog(data))
  ipc.handle(RENDERER_EVENTS.GET_IMAGE_INFO, ({ data }) => sharpExtra.getImageInfo(data))

  createWindow()

  createMenu()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
