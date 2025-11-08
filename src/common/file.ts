import fs from 'node:fs/promises'
import path from 'node:path'
import { isAcceptInput } from './format'

export interface FileInfo {
  root: string
  path: string
  dir: string
  base: string
  name: string
  ext: string
  isDir: boolean
  isFile: boolean
  size: number
  exists: boolean
}

export async function getFileInfo(file: string): Promise<FileInfo> {
  const parsed = path.parse(file)
  const stat = await fs.stat(file)
  const info: FileInfo = {
    root: parsed.dir,
    path: file,
    dir: parsed.dir,
    base: parsed.base,
    name: parsed.name,
    ext: parsed.ext.toLowerCase(),
    isDir: stat.isDirectory(),
    isFile: stat.isFile(),
    size: stat.size,
    exists: true
  }
  return info
}

export async function getFilesInfo(files: string[]): Promise<FileInfo[]> {
  return Promise.all(files.map(getFileInfo))
}

async function getImageFilesRecursive(
  files: string[],
  recursive = true,
  images: FileInfo[] = [],
  root = ''
): Promise<FileInfo[]> {
  await Promise.all(
    files.map(async (file) => {
      const info = await getFileInfo(file)
      if (info.isDir) {
        if (recursive) {
          const dir = file
          const subitems = await fs.readdir(dir)
          return getImageFilesRecursive(
            subitems.map((subitem) => path.join(dir, subitem)),
            recursive,
            images,
            root || dir
          )
        }
      } else if (isAcceptInput(file)) {
        if (!root) info.root = root
        images.push(info)
      }
      return void 0
    })
  )
  images.sort((a, b) => a.path.localeCompare(b.path, undefined, { numeric: true }))
  return images
}

export function getImageFiles(files: string[], recursive = true): Promise<FileInfo[]> {
  return getImageFilesRecursive(files, recursive)
}
