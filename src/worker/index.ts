import { parentPort } from 'node:worker_threads'
import { RENDERER_EVENTS, THREAD, WORKER_EVENTS, type IpcMsgBody } from '../ipc/events'
import { type Task } from './task'
import runner from './converter'

const port = parentPort
if (!port) throw new Error('IllegalState')

port.on('message', (msgBody: IpcMsgBody) => {
  if (msgBody.type === RENDERER_EVENTS.START_CONVERT) {
    runner.run(msgBody.data)
  } else if (msgBody.type === RENDERER_EVENTS.STOP_CONVERT) {
    runner.stop()
  }
})

runner.onTaskStateChange((task: Task) => {
  port.postMessage({
    thread: THREAD.WORKER,
    type: WORKER_EVENTS.TASK_STATE_CHANGED,
    data: task
  })
})

runner.onComplete(() => {
  port.postMessage({
    thread: THREAD.WORKER,
    type: WORKER_EVENTS.CONVERT_COMPLETE
  })
})
