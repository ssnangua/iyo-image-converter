import { Schema } from '../Schema'

export interface TIFF {
  quality: number
  compression: 'lzw' | 'deflate' | 'jpeg' | 'ccittfax4'
  predictor: 'none' | 'horizontal' | 'float'
  pyramid: boolean
  tileWidth: number
  tileHeight: number
  xres: number
  yres: number
  resolutionUnit: 'inch' | 'cm'
  bitdepth: 1 | 2 | 4 | 8
}

export const TIFFSchema: Schema = {
  name: 'TIFF',
  type: 'object',
  properties: {
    quality: {
      title: '质量',
      type: 'number',
      component: 'Slider',
      minimum: 1,
      maximum: 100,
      step: 1,
      default: 80
    },
    compression: {
      title: '压缩',
      type: 'string',
      enum: ['lzw', 'deflate', 'jpeg', 'ccittfax4'],
      enumLabels: ['lzw', 'deflate', 'jpeg', 'ccittfax4'],
      component: 'Select',
      default: 'jpeg'
    },
    predictor: {
      title: '压缩预测',
      type: 'string',
      enum: ['none', 'horizontal', 'float'],
      enumLabels: ['无', '水平', '浮动'],
      component: 'Select',
      default: 'horizontal'
    },
    pyramid: {
      title: '图像金字塔',
      type: 'boolean',
      default: false
    },
    tile: {
      title: '平铺',
      type: 'boolean',
      default: false
    },
    tileWidth: {
      title: '平铺宽度',
      type: 'number',
      minimum: 1,
      step: 1,
      default: 256
    },
    tileHeight: {
      title: '平铺高度',
      type: 'number',
      minimum: 1,
      step: 1,
      default: 256
    },
    xres: {
      title: '水平分辨率',
      type: 'number',
      minimum: 0.01,
      step: 0.01,
      default: 1
    },
    yres: {
      title: '垂直分辨率',
      type: 'number',
      minimum: 0.01,
      step: 0.01,
      default: 1
    },
    resolutionUnit: {
      title: '分辨率单位',
      type: 'string',
      enum: ['inch', 'cm'],
      enumLabels: ['英寸', '厘米'],
      default: 'inch'
    },
    bitdepth: {
      title: '位深度',
      type: 'number',
      enum: [1, 2, 4, 8],
      enumLabels: ['1', '2', '4', '8'],
      default: 8
    }
  }
}
