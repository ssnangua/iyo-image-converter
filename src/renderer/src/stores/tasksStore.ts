import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { type FileInfo } from '@common/file'
import { type Task } from '@worker/task'
import { WORKER_EVENTS } from '@ipc/events'
import { createTask } from './task'
import { useGlobalStore } from './globalStore'

interface TasksStore {
  tasks: Task[]
  selectedTasks: Task[]
}

const taskMap = new Map<number, Task>()

export const useTasksStore = create<TasksStore>()(
  immer(
    () =>
      <TasksStore>{
        tasks: [],
        selectedTasks: []
      }
  )
)

export async function addTasks(files: FileInfo[]) {
  const type = useGlobalStore.getState().type
  const tasks = files.map((input) => createTask(input, type))
  useTasksStore.setState((state) => {
    state.tasks.push(...tasks)
  })
  tasks.forEach((task) => {
    taskMap.set(task.id, task)
  })
}

export function removeTasks(tasks: Task[]) {
  const ids = tasks.filter((task) => task.state !== 'processing').map((task) => task.id)
  useTasksStore.setState((state) => {
    state.tasks = state.tasks.filter((task) => !ids.includes(task.id))
  })
  ids.forEach((id) => taskMap.delete(id))
}

export function clearTasks() {
  removeTasks(useTasksStore.getState().tasks)
}

export function updateTasks(tasks: Task[]) {
  tasks.forEach((task) => {
    const oldTask = taskMap.get(task.id)
    if (!oldTask) return
    const newTask = { ...oldTask, ...task }
    useTasksStore.setState((state) => {
      const index = state.tasks.findIndex(({ id }) => id === task.id)
      state.tasks[index] = newTask
    })
    taskMap.set(task.id, newTask)
  })
}

export function resetTasks(tasks: Task[]) {
  updateTasks(
    tasks
      .filter((task) => task.input.exists)
      .map((task) => ({
        ...createTask(task.input, task.type),
        id: task.id
      }))
  )
}

export function selectTasks(ids: number[]) {
  useTasksStore.setState((state) => {
    state.selectedTasks = ids.map((id) => taskMap.get(id)!)
  })
}

window.ipc.on(WORKER_EVENTS.TASK_STATE_CHANGED, (task: Task) => {
  updateTasks([task])
})
