import { Schema } from '../Schema'

export interface WEBP {
  quality: number
  alphaQuality: number
  lossless: boolean
  nearLossless: boolean
  smartSubsample: boolean
  effort: number
  loop: number
}

export const WEBPSchema: Schema = {
  name: 'WEBP',
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
    alphaQuality: {
      title: 'Alpha 层质量',
      type: 'number',
      component: 'Slider',
      minimum: 0,
      maximum: 100,
      step: 1,
      default: 100
    },
    lossless: {
      title: '无损压缩',
      description: '使用无损压缩模式',
      type: 'boolean',
      default: false
    },
    nearLossless: {
      title: '近无损压缩',
      description: '使用 near_lossless 压缩模式',
      type: 'boolean',
      default: false
    },
    smartSubsample: {
      title: '智能二次采样',
      description: '使用高质量色度二次采样',
      type: 'boolean',
      default: false
    },
    effort: {
      title: '算力',
      description: 'CPU 算力，1（最快）到 6（最慢）',
      type: 'number',
      component: 'Slider',
      minimum: 1,
      maximum: 6,
      step: 1,
      default: 4
    },
    loop: {
      title: '循环次数',
      description: '动画循环次数，0 表示无限循环',
      type: 'number',
      minimum: 0,
      maximum: 65535,
      step: 1,
      default: 0
    }
  }
}
