import { useGlobalStore } from '../stores/globalStore'
import { useTasksStore } from '../stores/tasksStore'
import { saveSettings, setSetting, useSettingsStore } from '../stores/settingsStore'
import { Checkbox, type CheckboxProps, Divider, Flex } from 'antd'
import { useMemo } from 'react'
import { humanFileSize } from '@renderer/common/utils'

function getTypeTip(type: string) {
  return type === 'TINY' ? '压缩图片' : `转换为 ${type}`
}

function getSelectedTasksCountTip(count: number) {
  return count > 1 ? `已选择 ${count} 个任务` : count === 1 ? `选中 ${count} 个任务` : ''
}

function InfoBar(): React.JSX.Element {
  const { type, hoverType } = useGlobalStore()
  const { tasks, selectedTasks } = useTasksStore()
  const completeNotify = useSettingsStore((state) => state.General.completeNotify)

  const inputTotalSize = useMemo(() => {
    return tasks.reduce((acc, task) => acc + (task.input.size || 0), 0)
  }, [tasks])
  const outputTotalSize = useMemo(() => {
    return tasks.reduce((acc, task) => acc + (task.output?.size || task.input.size || 0), 0)
  }, [tasks])
  const doneTasks = tasks.filter((task) => task.state === 'done' || task.state === 'error')

  const tip = useMemo(() => {
    if (hoverType) return getTypeTip(hoverType)
    if (selectedTasks.length > 0) return getSelectedTasksCountTip(selectedTasks.length)
    return getTypeTip(type)
  }, [type, hoverType, selectedTasks])

  const setCompleteNotify: CheckboxProps['onChange'] = () => {
    setSetting('General', { completeNotify: !completeNotify })
    saveSettings()
  }

  return (
    <Flex className="info-bar">
      <Flex flex="auto">{tip}</Flex>
      <div>
        {tasks.length > 0 && (
          <>
            <span>
              {humanFileSize(inputTotalSize)} / {humanFileSize(outputTotalSize)}
            </span>
            <Divider type="vertical" />
            <span>
              {doneTasks.length} / {tasks.length}
            </span>
            <Divider type="vertical" />
          </>
        )}
        <Checkbox checked={completeNotify} onChange={setCompleteNotify}>
          完成通知
        </Checkbox>
      </div>
    </Flex>
  )
}

export default InfoBar
