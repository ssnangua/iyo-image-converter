import { Input, Space } from 'antd'
import { memo, useState } from 'react'
import IconTextButton from '../IconTextButton'

interface PathProps {
  value?: string
  onChange?: <T>(p: T) => void
}

function Path({ value, onChange }: PathProps): React.JSX.Element {
  const [isDragOver, setIsDragOver] = useState(false)

  const handleDragOver = (e: React.DragEvent<HTMLInputElement>) => {
    setIsDragOver(true)
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDragLeave = (e: React.DragEvent<HTMLInputElement>) => {
    setIsDragOver(false)
    e.preventDefault()
    e.stopPropagation()
  }

  const setValue = async (files: string[]): Promise<void> => {
    const filesInfo = await window.api.getFilesInfo(files)
    const dir = filesInfo.find((file) => file?.isDir)?.path
    if (dir) onChange?.(dir)
  }

  const handleDrop = (e: React.DragEvent<HTMLInputElement>) => {
    setIsDragOver(false)
    e.preventDefault()
    e.stopPropagation()
    if (!e.dataTransfer) return
    setValue(
      Array.from(e.dataTransfer.files).map((file) => window.electron.webUtils.getPathForFile(file))
    )
  }

  const handleClick = () => {
    window.api
      .showOpenDialog({
        properties: ['openDirectory'],
        title: '选择文件夹',
        defaultPath: value
      })
      .then((res) => {
        if (res.canceled || !res.filePaths[0]) return
        setValue(res.filePaths)
      })
  }

  return (
    <Space.Compact style={{ width: '100%' }}>
      <Input
        value={value}
        onChange={onChange}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        placeholder="拖拽文件夹到此处"
        className={isDragOver ? 'input-drag-enter' : ''}
      />
      <IconTextButton icon="icon-open-dir" onClick={handleClick} />
    </Space.Compact>
  )
}

export default memo(Path)
