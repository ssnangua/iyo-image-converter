import { memo, useEffect, useMemo, useRef } from 'react'
import {
  addTasks,
  clearTasks,
  removeTasks,
  resetTasks,
  selectTasks,
  updateTasks,
  useTasksStore
} from '../stores/tasksStore'
import { useGlobalStore } from '@renderer/stores/globalStore'
import { useSettingsStore } from '@renderer/stores/settingsStore'
import VirtualTable from './table/VirtualTable'
import columns from './table/columns'
import { classObject, isShortcut } from '@renderer/common/utils'
import { type Task } from '@worker/task'
import { createTask } from '@renderer/stores/task'
import rowSelector from './table/rowSelector'
import { MAIN_EVENTS, RENDERER_EVENTS } from '@ipc/events'

function TaskList(): React.JSX.Element {
  const taskListWrapperRef = useRef<HTMLDivElement>(null)

  const { showTaskIndex, showTaskPreview, readFolders } = useSettingsStore((state) => state.General)
  const showColumns = useMemo(() => {
    const showColumns = columns.slice(2)
    if (showTaskPreview) showColumns.unshift(columns[1])
    if (showTaskIndex) showColumns.unshift(columns[0])
    return showColumns
  }, [showTaskIndex, showTaskPreview])

  const isProcessing = useGlobalStore((state) => state.isProcessing)
  const { tasks, selectedTasks } = useTasksStore()

  const handleSelectRows = (rows: Task[]) => {
    selectTasks(rows.map((task) => task.id))
  }

  const handleContextMenu = (rows: Task[]) => {
    window.ipc.emit(RENDERER_EVENTS.SHOW_TASKS_MENU, rows)
  }

  useEffect(() => {
    const handleTasksMenuCallback = ({ action, type }: { action: string; type: string }) => {
      switch (action) {
        case 'remove':
          removeTasks(selectedTasks)
          break
        case 'reset':
          resetTasks(selectedTasks)
          break
        case 'clear':
          clearTasks()
          break
        case 'type':
          updateTasks(
            selectedTasks.map((task) => {
              const newTask = createTask(task.input, type)
              return { ...newTask, id: task.id }
            })
          )
          break
        case 'select-all':
          rowSelector.selectAll()
          break
        case 'invert-selection':
          rowSelector.invertSelection()
          break
      }
    }

    const handleKeydown = (e: KeyboardEvent) => {
      if (isShortcut(e, 'Delete')) {
        removeTasks(selectedTasks)
      } else if (isShortcut(e, 'CmdOrCtrl+R')) {
        resetTasks(selectedTasks)
      } else if (isShortcut(e, 'CmdOrCtrl+A')) {
        rowSelector.selectAll()
      }
    }

    window.ipc.on(MAIN_EVENTS.TASKS_MENU_CALLBACK, handleTasksMenuCallback)
    window.addEventListener('keydown', handleKeydown)
    return () => {
      window.ipc.off(MAIN_EVENTS.TASKS_MENU_CALLBACK)
      window.removeEventListener('keydown', handleKeydown)
    }
  }, [selectedTasks])

  const handleDragOver = (e: React.DragEvent) => {
    taskListWrapperRef.current?.classList.add('task-list-drag-over')
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDragLeave = (e: React.DragEvent) => {
    if ((e.target as HTMLDivElement).classList.contains('task-list-wrapper')) {
      taskListWrapperRef.current?.classList.remove('task-list-drag-over')
      e.preventDefault()
      e.stopPropagation()
    }
  }

  const handleFiles = async (files: string[]): Promise<void> => {
    const imageFiles = await window.api.getImageFiles(files, readFolders)
    addTasks(imageFiles)
  }

  const handleDrop = (e: React.DragEvent) => {
    taskListWrapperRef.current?.classList.remove('task-list-drag-over')
    e.preventDefault()
    e.stopPropagation()
    if (!e.dataTransfer) return
    const files = Array.from(e.dataTransfer.files).map((file) =>
      window.electron.webUtils.getPathForFile(file)
    )
    handleFiles(files)
  }

  return (
    <div
      ref={taskListWrapperRef}
      className={classObject({
        'task-list-wrapper': true,
        'is-processing': isProcessing
      })}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* {Math.random()} */}
      <VirtualTable
        columns={showColumns}
        data={tasks}
        onSelectRows={handleSelectRows}
        onContextMenu={handleContextMenu}
      ></VirtualTable>
    </div>
  )
}

export default memo(TaskList)
