import { memo } from 'react'
import { Image } from 'antd'
import { ColumnDef } from '@tanstack/react-table'
import dayjs from 'dayjs'
import { type Task } from '@worker/task'
import { humanFileSize } from '@renderer/common/utils'
import { removeTasks, resetTasks } from '@renderer/stores/tasksStore'
import IconTextButton from '@renderer/components/IconTextButton'
import ProcessingIcon from '@renderer/components/ProcessingIcon'
import IconFont from '../IconFont'

enum STATE {
  pending = '待处理',
  processing = '处理中',
  done = '完成',
  error = '失败'
}

function stopPropagation(e: React.MouseEvent) {
  e.stopPropagation()
}
function stopPropagationIfButton(e: React.MouseEvent) {
  if (!!(e.target as HTMLElement).closest('button')) {
    e.stopPropagation()
  }
}

function openImage(e: React.MouseEvent) {
  const path = (e.target as any).closest('[data-path]')?.dataset.path
  if (!window.fs.existsSync(path)) {
    alert('文件不存在')
  } else {
    window.shell.openPath(path)
  }
}

function showInFolder(e: React.MouseEvent) {
  const path = (e.target as any).closest('[data-path]')?.dataset.path
  if (!window.fs.existsSync(path)) {
    alert('文件不存在')
  } else {
    window.shell.showItemInFolder(path)
  }
}

async function showImageInfo(e: React.MouseEvent): Promise<void> {
  const path = (e.target as any).closest('[data-path]')?.dataset.path
  if (!window.fs.existsSync(path)) {
    alert('文件不存在')
    return
  }
  const info = await window.api.getImageInfo(path).catch((error) => {
    alert(error)
  })
  if (!info) return
  const pages = info.pages ? `（${info.pages} 帧）` : ''
  const date = dayjs(info.mtime).format('YYYY-MM-DD HH:mm:ss')
  const infoList = [
    `　文件名：${info.base}`,
    `　　位置：${info.location}`,
    `　　类型：${info.type}`,
    `　　大小：${humanFileSize(info.size)}`,
    `日期时间：${date}`,
    `　　属性：${info.width}×${info.height}${pages}`
  ]
  if (info.density && info.width && info.height) {
    const inchWidth = (info.width / info.density).toFixed(2)
    const inchHeight = (info.height / info.density).toFixed(2)
    const printSize = `打印大小：${inchWidth}×${inchHeight} 英寸，DPI：${info.density}`
    infoList.push(printSize)
  }
  alert(infoList.join('\r\n'))
}

// function showSettings() {}

function encodePath(path: string): string {
  return path.replace(/ /g, '%20').replace(/#/g, '%23').replace(/\?/g, '%3F')
}

const Index: React.FC<{ index: number }> = memo(({ index }) => {
  return (
    <>
      {/* <div>{Math.random()}</div> */}
      <span>{index + 1}</span>
    </>
  )
})

const Preview: React.FC<{ task: Task }> = memo(({ task }) => {
  return (
    <span onClick={stopPropagation}>
      {/* <div>{Math.random()}</div> */}
      <Image
        width={100}
        height={50}
        src={encodePath(task.input.path)}
        fallback={encodePath(task.output.path)}
        loading="lazy"
      />
    </span>
  )
})

const Input: React.FC<{ task: Task }> = memo(({ task }) => {
  return (
    <div className={task.input.exists ? '' : 'removed'}>
      {/* <div>{Math.random()}</div> */}
      <div className="file-base">
        <span title={task.input.path}>{task.input.base}</span>
      </div>
      <div className="file-size">{humanFileSize(task.input.size)}</div>
      <div className="task-action" data-path={task.input.path} onClick={stopPropagationIfButton}>
        <IconTextButton
          disabled={!task.input.exists}
          icon="icon-open-file"
          title="打开图片"
          onClick={openImage}
        />
        <IconTextButton
          disabled={!task.input.exists}
          icon="icon-open-dir"
          title="打开目录"
          onClick={showInFolder}
        />
        <IconTextButton
          disabled={!task.input.exists}
          icon="icon-info"
          title="图片信息"
          onClick={showImageInfo}
        />
      </div>
    </div>
  )
})

const Output: React.FC<{ task: Task }> = memo(({ task }) => {
  return (
    <>
      {/* <div>{Math.random()}</div> */}
      <div className="type">
        <span className={task.type}>{task.type}</span>
      </div>
      {task.state === 'done' && <div className="file-size">{humanFileSize(task.output.size)}</div>}
      <div className="task-action" data-path={task.output.path} onClick={stopPropagationIfButton}>
        <IconTextButton
          disabled={!task.output.exists}
          icon="icon-open-file"
          title="打开图片"
          onClick={openImage}
        />
        <IconTextButton
          disabled={!task.output.exists}
          icon="icon-open-dir"
          title="打开目录"
          onClick={showInFolder}
        />
        <IconTextButton
          disabled={!task.output.exists}
          icon="icon-info"
          title="图片信息"
          onClick={showImageInfo}
        />
        {/* <IconTextButton
          disabled={task.state !== 'pending'}
          icon="icon-setting"
          title="输出配置"
          onClick={showSettings}
        /> */}
      </div>
    </>
  )
})

const State: React.FC<{ task: Task }> = memo(({ task }) => {
  return (
    <>
      {/* <div>{Math.random()}</div> */}
      <div className={`state-${task.state}`}>
        {task.state === 'processing' ? <ProcessingIcon /> : null}
        {STATE[task.state]}
      </div>
      {task.state === 'done' ? (
        <div className="file-size">
          {task.output.size > task.input.size ? (
            <IconFont icon="icon-arrow-up" />
          ) : (
            <IconFont icon="icon-arrow-down" />
          )}
          {humanFileSize(Math.abs(task.output.size - task.input.size))}
        </div>
      ) : null}
      <div className="task-action" onClick={stopPropagationIfButton}>
        <IconTextButton
          disabled={(task.state !== 'done' && task.state !== 'error') || !task.input.exists}
          icon="icon-reset"
          title="重置任务"
          onClick={() => resetTasks([task])}
        />
        <IconTextButton
          disabled={task.state !== 'done' && task.state !== 'error' && task.state !== 'pending'}
          icon="icon-delete"
          title="移除任务"
          onClick={() => removeTasks([task])}
        />
        {task.error ? (
          <IconTextButton icon="icon-info" title="错误信息" onClick={() => alert(task.error)} />
        ) : null}
      </div>
    </>
  )
})

const columns: ColumnDef<Task>[] = [
  {
    id: 'index',
    header: '#',
    cell: (info) => <Index index={info.row.index} />
  },
  {
    id: 'preview',
    header: '预览',
    cell: (info) => <Preview task={info.row.original} />
  },
  {
    id: 'input',
    accessorFn: (row) => row.input.path,
    header: '路径',
    cell: (info) => <Input task={info.row.original} />
  },
  {
    id: 'output',
    header: '输出',
    cell: (info) => <Output task={info.row.original} />
  },
  {
    id: 'state',
    accessorKey: 'state',
    header: '状态',
    cell: (info) => <State task={info.row.original} />
  }
]

export default columns
