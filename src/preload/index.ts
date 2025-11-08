import fs from 'node:fs'
import path from 'node:path'
import { contextBridge, shell } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import api from './api'
import ipc from '../ipc/renderer'

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('fs', fs)
    contextBridge.exposeInMainWorld('path', path)
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('shell', shell)
    contextBridge.exposeInMainWorld('api', api)
    contextBridge.exposeInMainWorld('ipc', ipc)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.fs = fs
  // @ts-ignore (define in dts)
  window.path = path
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.shell = shell
  // @ts-ignore (define in dts)
  window.api = api
  // @ts-ignore (define in dts)
  window.ipc = ipc
}
