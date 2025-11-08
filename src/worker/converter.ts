import fs from 'node:fs'
import sharpExtra from '@ssnangua/sharp-extra'
import { getFileInfo } from '../common/file'
import { isAnimeFormat } from '../common/format'
import { type Task } from './task'
import { getOutput } from './output'

sharpExtra.sharp.cache(false)

let handleTaskStateChange: (task: Task) => void
let handleComplete: () => void

let queue: Task[] = []
let runningTasks: number = 0
let isStop = false

async function runNextTask() {
  const task = queue.shift()
  if (!task) {
    runningTasks -= 1
    if (runningTasks === 0) {
      handleComplete()
    }
    return
  }

  if (!fs.existsSync(task.input.path)) {
    task.state = 'error'
    task.error = 'File not found'
    handleTaskStateChange(task)
    return
  }

  task.state = 'processing'
  handleTaskStateChange(task)

  try {
    const image = await sharpExtra(task.input.path)

    const format = task.format.toLowerCase()
    const formatted = image.toFormat(format, task.formatOptions)

    if (task.generalOptions.timeout > 0) {
      image.timeout({ seconds: task.generalOptions.timeout })
    }

    const toFrames =
      // 源图有多帧 && (转换为非动图 || 强制输出帧)
      formatted.frames.length > 1 && (!isAnimeFormat(format) || !task.generalOptions.outputAnimated)

    let output = getOutput(task, toFrames)
    if (!fs.existsSync(output.dir)) {
      fs.mkdirSync(output.dir, { recursive: true })
    }

    if (toFrames) {
      const files = await formatted.toFrameFiles(output.path, false)
      output.path = files[0]
    } else {
      await formatted.toFile(output.path)
    }

    task.output = await getFileInfo(output.path)
    task.state = 'done'
  } catch (error) {
    task.state = 'error'
    task.error = error
  }

  handleTaskStateChange(task)

  if (!isStop) {
    runNextTask()
  }
}

function run(tasks: Task[]) {
  if (tasks.length === 0) return
  queue = tasks
  runningTasks = 0
  isStop = false
  const concurrently = tasks[0].generalOptions.concurrently
  for (let i = 0; i < concurrently; i++) {
    runningTasks += 1
    runNextTask()
  }
}

function stop() {
  queue = []
  runningTasks = 0
  isStop = true
}

export default {
  run,
  stop,
  onTaskStateChange(handler: (task: Task) => void) {
    handleTaskStateChange = handler
  },
  onComplete(handler: () => void) {
    handleComplete = handler
  }
}
