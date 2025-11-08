import { type FileInfo } from '../common/file'
import { General } from '../settings/schemas'

export interface Task {
  id: number
  type: string // 'TINY', 'WEBP'
  format: string // 'webp', 'jpeg'
  input: FileInfo
  output: FileInfo
  generalOptions: General
  formatOptions: any
  state: 'pending' | 'processing' | 'done' | 'error'
  error?: any
}
