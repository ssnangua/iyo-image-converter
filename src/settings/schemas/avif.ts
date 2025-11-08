import { Schema } from '../Schema'

export interface AVIF {
  quality: number
  lossless: boolean
  effort: number
  chromaSubsampling: '4:2:0' | '4:4:4'
}

export const AVIFSchema: Schema = {
  name: 'AVIF',
  type: 'object',
  properties: {
    quality: {
      title: '质量',
      type: 'number',
      component: 'Slider',
      minimum: 1,
      maximum: 100,
      step: 1,
      default: 50
    },
    lossless: {
      title: '无损压缩',
      type: 'boolean',
      default: false
    },
    effort: {
      title: '算力',
      description: 'CPU 算力，0（最快）到 9（最慢）',
      type: 'number',
      component: 'Slider',
      minimum: 0,
      maximum: 9,
      step: 1,
      default: 4
    },
    chromaSubsampling: {
      title: '色度二次采样',
      type: 'string',
      enum: ['4:2:0', '4:4:4'],
      enumLabels: ['是（4:2:0）', '否（4:4:4）'],
      component: 'Select',
      default: '4:4:4'
    }
  }
}
