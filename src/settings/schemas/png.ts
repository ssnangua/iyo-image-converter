import { Schema } from '../Schema'

export interface PNG {
  progressive: boolean
  compressionLevel: number
  adaptiveFiltering: boolean
  palette: boolean
  quality: number
  effort: number
  colors: number
  dither: number
}

const limitedByPalette: Schema['dependencies'] = {
  fields: ['palette'],
  handler: (data) => {
    return { disabled: data.palette === false }
  }
}

export const PNGSchema: Schema = {
  name: 'PNG',
  type: 'object',
  properties: {
    progressive: {
      title: '渐进式',
      description: '使用渐进式（隔行扫描）',
      type: 'boolean',
      default: false
    },
    compressionLevel: {
      title: '压缩级别',
      description: 'zlib 压缩级别，0（速度最快，文件最大）到 9（速度最慢，文件最小）',
      type: 'number',
      component: 'Slider',
      minimum: 0,
      maximum: 9,
      step: 1,
      default: 6
    },
    adaptiveFiltering: {
      title: '自适应滤波',
      description: '使用自适应滤波器',
      type: 'boolean',
      default: false
    },
    palette: {
      title: '调色板',
      description: '量化为支持 Alpha 透明度的基于调色板的图像',
      type: 'boolean',
      default: false
    },
    quality: {
      title: '质量',
      description: '使用达到给定质量所需的最少颜色数',
      type: 'number',
      component: 'Slider',
      minimum: 0,
      maximum: 100,
      step: 1,
      default: 100,
      dependencies: limitedByPalette
    },
    effort: {
      title: '算力',
      description: 'CPU 算力，1（最快）到 10（最慢）',
      type: 'number',
      component: 'Slider',
      minimum: 1,
      maximum: 10,
      step: 1,
      default: 7,
      dependencies: limitedByPalette
    },
    colors: {
      title: '颜色数',
      type: 'number',
      component: 'Slider',
      minimum: 2,
      maximum: 256,
      step: 1,
      default: 256,
      dependencies: limitedByPalette
    },
    dither: {
      title: '抖动',
      description: 'Floyd-Steinberg 误差扩散级别',
      type: 'number',
      component: 'Slider',
      minimum: 0,
      maximum: 1,
      step: 0.01,
      default: 1,
      dependencies: limitedByPalette
    }
  }
}
