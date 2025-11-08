import fs from 'node:fs'
import path from 'node:path'
import { shell } from 'electron'
import { ElectronAPI } from '@electron-toolkit/preload'
import api from './api'
import ipc from './ipc'

declare global {
  interface Window {
    fs: typeof fs
    path: typeof path
    electron: ElectronAPI
    shell: typeof shell
    api: typeof api
    ipc: typeof ipc
  }
}
