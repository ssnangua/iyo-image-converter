import path from 'node:path'
import fs from 'node:fs'
import sharpExtra from '@ssnangua/sharp-extra'
import * as schemas from './schemas'
import { getDefaultSettings, type Settings } from './Settings'

// 获取最大并发数
const sharpConcurrency = sharpExtra.sharp.concurrency()
Object.assign(schemas.GeneralSchema.properties!.concurrently, {
  maximum: sharpConcurrency,
  default: sharpConcurrency
})

export function getSharpConcurrency() {
  return sharpConcurrency
}

let settings = getDefaultSettings()

// 加载设置文件
const settingsFile = path.resolve('settings.json')
if (fs.existsSync(settingsFile)) {
  try {
    settings = JSON.parse(fs.readFileSync(settingsFile, 'utf8'))
  } catch (e) {}
}

export function getSettings() {
  return settings
}

export async function saveSettings(newSettings: Settings) {
  settings = newSettings
  await fs.promises.writeFile(settingsFile, JSON.stringify(settings, null, 2))
}
