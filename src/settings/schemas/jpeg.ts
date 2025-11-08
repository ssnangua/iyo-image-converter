import { Schema } from '../Schema'

export interface JPEG {
  quality: number
  progressive: boolean
  chromaSubsampling: '4:2:0' | '4:4:4'
  optimiseCoding: boolean
  mozjpeg: boolean
  trellisQuantisation: boolean
  overshootDeringing: boolean
  optimiseScans: boolean
  quantisationTable: number
}

export const JPEGSchema: Schema = {
  name: 'JPEG',
  type: 'object',
  properties: {
    quality: {
      title: '质量',
      type: 'number',
      component: 'Slider',
      step: 1,
      minimum: 1,
      maximum: 100,
      default: 80
    },
    progressive: {
      title: '渐进式',
      description: '使用渐进式（隔行扫描）',
      type: 'boolean',
      default: false
    },
    chromaSubsampling: {
      title: '色度二次采样',
      type: 'string',
      enum: ['4:2:0', '4:4:4'],
      enumLabels: ['是（4:2:0）', '否（4:4:4）'],
      component: 'Select',
      default: '4:2:0'
    },
    optimiseCoding: {
      title: '优化编码',
      description: '优化霍夫曼编码表',
      type: 'boolean',
      default: true
    },
    mozjpeg: {
      title: 'MozJPEG',
      description:
        '使用 MozJPEG 默认配置（网络量化：true，过冲延迟：true，优化扫描：true，量化表：3）',
      type: 'boolean',
      default: false
    },
    trellisQuantisation: {
      title: '网格量化',
      type: 'boolean',
      default: false,
      dependencies: {
        fields: ['mozjpeg'],
        handler: (data) => {
          return data.mozjpeg === true ? { disabled: true, value: true } : {}
        }
      }
    },
    overshootDeringing: {
      title: '过冲延迟',
      type: 'boolean',
      default: false,
      dependencies: {
        fields: ['mozjpeg'],
        handler: (data) => {
          return data.mozjpeg === true ? { disabled: true, value: true } : {}
        }
      }
    },
    optimiseScans: {
      title: '优化扫描',
      type: 'boolean',
      default: false,
      dependencies: {
        fields: ['mozjpeg'],
        handler: (data) => {
          return data.mozjpeg === true ? { disabled: true, value: true } : {}
        }
      }
    },
    quantisationTable: {
      title: '量化表',
      description: '优化渐进式扫描，强制渐进式',
      type: 'number',
      component: 'Slider',
      step: 1,
      minimum: 0,
      maximum: 8,
      default: 0,
      dependencies: {
        fields: ['mozjpeg'],
        handler: (data) => {
          return data.mozjpeg === true ? { disabled: true, value: 3 } : {}
        }
      }
    }
  }
}
