import { Schema } from '../Schema'

export interface General {
  outputFolder: string
  appendFilename: string
  overwriteOutputFile: boolean
  afterProcessing: 'none' | 'moveSourceFileToTrash' | 'deleteSourceFile'
  skipSameFormat: boolean
  concurrently: number
  timeout: number
  outputAnimated: boolean
  animeExtractFrames: 'firstFrame' | 'allFrames'
  animeNewFolder: boolean
  icoExtractFrames: 'largestFrame' | 'allFrames' | 'extractSizes'
  icoExtractSizes: number[]
  icoNewFolder: boolean
  readFolders: boolean
  keepDirectoryStructure: boolean
  completeNotify: boolean
  showTaskIndex: boolean
  showTaskPreview: boolean
}

export const GeneralSchema: Schema = {
  name: 'General',
  type: 'object',
  properties: {
    // -------------------- 输出 --------------------
    outputFolder: {
      divider: '输出',
      title: '输出文件夹',
      description: '如果不设置，则默认输出到源文件目录',
      type: 'string',
      component: 'Path',
      default: ''
    },
    appendFilename: {
      title: '文件名后缀',
      type: 'string',
      default: ''
    },
    overwriteOutputFile: {
      title: '覆盖目标文件',
      description: '目标文件存在时，覆盖目标文件',
      type: 'boolean',
      default: false
    },
    afterProcessing: {
      title: '图片处理后',
      type: 'string',
      enum: ['none', 'moveSourceFileToTrash', 'deleteSourceFile'],
      enumLabels: ['无处理', '将源文件移到回收站', '删除源文件'],
      component: 'Select',
      default: 'none'
    },
    skipSameFormat: {
      title: '跳过相同格式',
      description: '转换图片格式时，如果输入格式与输出格式相同，则不处理',
      type: 'boolean',
      default: false
    },
    concurrently: {
      title: '并发处理',
      description: '同时处理多个图片',
      type: 'number',
      component: 'Slider',
      step: 1,
      minimum: 1,
      maximum: 16,
      default: 10
    },
    timeout: {
      title: '超时时间',
      description: '每张图片的处理超时时间（秒数），0表示不限制',
      type: 'number',
      step: 1,
      minimum: 0,
      default: 60
    },

    // -------------------- 动图 --------------------
    outputAnimated: {
      divider: '动图',
      title: '输出动图',
      description: '动图转换为 GIF/WEBP/APNG 时，是否输出为动图（否则输出动画帧）',
      type: 'boolean',
      default: true
    },
    animeExtractFrames: {
      title: '导出帧',
      description: '动图转换为非动图时，要导出哪些帧',
      type: 'string',
      enum: ['firstFrame', 'allFrames'],
      enumLabels: ['第一帧', '全部帧'],
      default: 'allFrames'
    },
    animeNewFolder: {
      title: '新建文件夹',
      description: '导出所有帧时，创建新文件夹',
      type: 'boolean',
      default: true,
      dependencies: {
        fields: ['animeExtractFrames'],
        handler: (data) => {
          return {
            disabled: data.animeExtractFrames === 'firstFrame'
          }
        }
      }
    },

    // -------------------- ICO --------------------
    icoExtractFrames: {
      divider: 'ICO',
      title: '导出',
      description: 'ICO转换为其他格式时，要导出哪些尺寸',
      type: 'string',
      enum: ['largestFrame', 'allFrames', 'extractSizes'],
      enumLabels: ['最大尺寸', '所有尺寸', '自定义'],
      default: 'allFrames'
    },
    icoExtractSizes: {
      title: '导出尺寸',
      type: 'array',
      enum: [16, 24, 32, 48, 64, 72, 96, 128, 256],
      enumLabels: [
        '16 × 16',
        '24 × 24',
        '32 × 32',
        '48 × 48',
        '64 × 64',
        '72 × 72',
        '96 × 96',
        '128 × 128',
        '256 × 256'
      ],
      default: [16, 24, 32, 48, 64, 72, 96, 128, 256],
      dependencies: {
        fields: ['icoExtractFrames'],
        handler: (data) => {
          return {
            disabled: data.icoExtractFrames !== 'extractSizes'
          }
        }
      }
    },
    icoNewFolder: {
      title: '新建文件夹',
      description: '导出多个尺寸时，创建新文件夹',
      type: 'boolean',
      default: true,
      dependencies: {
        fields: ['icoExtractFrames', 'icoExtractSizes'],
        handler: (data) => {
          return {
            disabled: data.icoExtractFrames === 'largestFrame' || data.icoExtractSizes?.length <= 1
          }
        }
      }
    },

    // -------------------- 输入 --------------------
    readFolders: {
      divider: '输入',
      title: '读取文件夹',
      description: '拖放时读取文件夹，否则只读取文件',
      type: 'boolean',
      default: true
    },
    keepDirectoryStructure: {
      title: '保持目录结构',
      description: '在输出文件夹中，保持拖放时的目录结构',
      type: 'boolean',
      default: true,
      dependencies: {
        fields: ['readFolders'],
        handler: (data) => {
          return {
            disabled: data.readFolders === false
          }
        }
      }
    },

    // -------------------- 界面 --------------------
    completeNotify: {
      divider: '界面',
      title: '完成通知',
      type: 'boolean',
      default: true
    },
    showTaskIndex: {
      title: '显示任务索引',
      type: 'boolean',
      default: true
    },
    showTaskPreview: {
      title: '显示图片预览',
      type: 'boolean',
      default: true
    }
  }
}
