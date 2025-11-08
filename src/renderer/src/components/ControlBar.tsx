import { memo, useCallback } from 'react'
import { Flex, Divider } from 'antd'
import IconTextButton from './IconTextButton'
import { addTasks, clearTasks, removeTasks, useTasksStore } from '../stores/tasksStore'
import { emitter, PAGE_EVENT } from '../common/bus'
import { setIsProcessing, useGlobalStore } from '../stores/globalStore'
import { EXT_FORMAT } from '@common/format'

const extensions = Object.keys(EXT_FORMAT).map((ext) => ext.replace('.', ''))

function ControlBar(): React.JSX.Element {
  const { tasks, selectedTasks } = useTasksStore()
  const isProcessing = useGlobalStore((state) => state.isProcessing)

  const pendingTasks = tasks.filter((task) => task.state === 'pending')

  const openSettings = useCallback(() => {
    emitter.emit(PAGE_EVENT.SHOW_SETTINGS)
  }, [])

  const add = () => {
    window.api
      .showOpenDialog({
        properties: ['openFile', 'multiSelections', 'showHiddenFiles'],
        filters: [{ name: '图片', extensions }]
      })
      .then(async (res) => {
        const imageFiles = await window.api.getImageFiles(res.filePaths)
        addTasks(imageFiles)
      })
  }

  const stop = () => {
    setIsProcessing(false)
    window.api.stopCovert()
  }

  const start = () => {
    setIsProcessing(true)
    window.api.startCovert(pendingTasks)
  }

  return (
    <Flex className="control-bar">
      {/* {Math.random()} */}
      <div>
        <IconTextButton type="text" icon="icon-setting" text="选项" onClick={openSettings} />
        {/* <Divider type="vertical" />
        <IconTextButton type="text" icon="icon-crop-rotate" text="裁切与旋转" /> */}
      </div>
      <Flex flex="auto" justify="flex-end" align="center">
        <IconTextButton
          type="text"
          icon="icon-add"
          text="添加"
          disabled={isProcessing}
          onClick={add}
        />
        <Divider type="vertical" />
        <IconTextButton
          type="text"
          icon="icon-remove"
          text="移除"
          disabled={selectedTasks.length === 0 || isProcessing}
          onClick={() => removeTasks(selectedTasks)}
        />
        <IconTextButton
          type="text"
          icon="icon-clear"
          text="清空"
          disabled={tasks.length === 0 || isProcessing}
          onClick={clearTasks}
        />
        <Divider type="vertical" />
        <IconTextButton
          type="text"
          icon="icon-stop"
          text="停止"
          className="stop-btn"
          disabled={!isProcessing}
          onClick={stop}
        />
        <IconTextButton
          type="text"
          icon="icon-start"
          text="开始"
          className="start-btn"
          disabled={pendingTasks.length === 0 || isProcessing}
          onClick={start}
        />
      </Flex>
    </Flex>
  )
}

export default memo(ControlBar)
