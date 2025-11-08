import { type FileInfo } from '@common/file'
import { type Task } from '@worker/task'
import { getSetting } from './settingsStore'
import { EXT_FORMAT } from '@common/format'

function getTinyOptions(format: string) {
  const options = getSetting(format)
  const tiny = getSetting('TINY')
  switch (format) {
    case 'JPEG':
      return { ...options, quality: tiny.JPEG }
    case 'PNG':
      return { ...options, quality: tiny.PNG, palette: true }
    case 'WEBP':
      return { ...options, quality: tiny.WEBP }
    case 'GIF':
      return { ...options, colors: tiny.GIF }
    case 'APNG':
      return { ...options, cnum: tiny.APNG, lossless: false }
    case 'ICO':
      return { ...options }
    case 'BMP':
      return { ...options }
    case 'TIFF':
      return { ...options, quality: tiny.TIFF }
    case 'AVIF':
      return { ...options, quality: tiny.AVIF }
    case 'HEIF':
      return { ...options, quality: tiny.HEIF }
    default:
      return options
  }
}

let __taskId__ = 0

export function createTask(input: FileInfo, type: string): Task {
  const generalOptions = getSetting('General')
  let format, formatOptions
  if (type === 'TINY') {
    format = EXT_FORMAT[input.ext.toLowerCase()]
    formatOptions = getTinyOptions(format)
  } else {
    format = type
    formatOptions = getSetting(type)
  }
  return {
    id: __taskId__++,
    type,
    input,
    output: createDefaultOutput(),
    format,
    formatOptions,
    generalOptions,
    state: 'pending'
  }
}

export function createDefaultOutput(): FileInfo {
  return {
    root: '',
    path: '',
    dir: '',
    base: '',
    name: '',
    ext: '',
    isDir: false,
    isFile: true,
    size: 0,
    exists: false
  }
}
