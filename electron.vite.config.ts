import { resolve } from 'path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()]
  },
  preload: {
    plugins: [externalizeDepsPlugin()]
  },
  renderer: {
    plugins: [react()],
    resolve: {
      alias: {
        '@common': resolve('src/common'),
        '@ipc': resolve('src/ipc'),
        '@renderer': resolve('src/renderer/src'),
        '@settings': resolve('src/settings'),
        '@worker': resolve('src/workers')
      }
    }
  }
})
