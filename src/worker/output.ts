import path from 'node:path'
import fs from 'node:fs'
import { type FileInfo } from '../common/file'
import { FORMAT_EXT } from '../common/format'
import { type Task } from './task'

function getOutputFolder(task: Task, toFrames: boolean) {
  const { input, generalOptions } = task
  const { outputFolder, keepDirectoryStructure } = generalOptions
  let outDir = outputFolder
    ? keepDirectoryStructure && input.root
      ? input.dir.replace(path.resolve(input.root, '..'), outputFolder)
      : outputFolder
    : input.dir
  if (toFrames) {
    const { animeExtractFrames, animeNewFolder, icoExtractFrames, icoExtractSizes, icoNewFolder } =
      generalOptions
    const newFolder =
      input.ext === '.ico'
        ? icoNewFolder && icoExtractFrames !== 'largestFrame' && icoExtractSizes.length > 1
        : animeNewFolder && animeExtractFrames !== 'firstFrame'
    if (newFolder) outDir = path.join(outDir, input.name)
  }
  return outDir
}

export function getOutput(task: Task, toFrames: boolean): FileInfo {
  const { input, format, generalOptions } = task
  const { appendFilename, overwriteOutputFile } = generalOptions
  const outputFolder = getOutputFolder(task, toFrames)
  let name = `${input.name}${appendFilename}`
  const ext = FORMAT_EXT[format] || input.ext
  let fileOut = path.join(outputFolder, `${name}${ext}`)
  if (!overwriteOutputFile) {
    let newName = name
    while (fs.existsSync(fileOut)) {
      const index = Number(newName.match(/ \((\d+)\)$/)?.[1] || 0) + 1
      newName = `${name} (${index})`
      fileOut = path.join(outputFolder, `${newName}${ext}`)
    }
    name = newName
  }
  const { dir, base } = path.parse(fileOut)
  return {
    root: '',
    path: fileOut,
    dir,
    base,
    name,
    ext,
    isDir: false,
    isFile: true,
    size: 0,
    exists: false
  }
}
