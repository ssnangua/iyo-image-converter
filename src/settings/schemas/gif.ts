import { Schema } from '../Schema'

export interface GIF {
  colors: number
  effort: number
  dither: number
  loop: number
}

export const GIFSchema: Schema = {
  name: 'GIF',
  type: 'object',
  properties: {
    colors: {
      title: '颜色数',
      type: 'number',
      component: 'Slider',
      minimum: 2,
      maximum: 256,
      step: 1,
      default: 256
    },
    effort: {
      title: '算力',
      description: 'CPU 算力，1（最快）到 10（最慢）',
      type: 'number',
      component: 'Slider',
      minimum: 1,
      maximum: 10,
      step: 1,
      default: 7
    },
    dither: {
      title: '抖动',
      description: 'Floyd-Steinberg 误差扩散级别',
      type: 'number',
      component: 'Slider',
      minimum: 0,
      maximum: 1,
      step: 0.01,
      default: 1
    },
    loop: {
      title: '循环次数',
      description: '动画循环次数，0 表示无限次',
      type: 'number',
      minimum: 0,
      maximum: 65535,
      step: 1,
      default: 0
    }
  }
}
