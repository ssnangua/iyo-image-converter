import { Schema } from '../Schema'

export interface APNG {
  transparent: boolean
  lossless: boolean
  cnum: number
}

export const APNGSchema: Schema = {
  name: 'APNG',
  type: 'object',
  properties: {
    transparent: {
      title: '背景透明',
      type: 'boolean',
      default: false
    },
    lossless: {
      title: '无损压缩',
      type: 'boolean',
      default: true
    },
    cnum: {
      title: '颜色数',
      type: 'number',
      component: 'Slider',
      minimum: 1,
      maximum: 256,
      step: 1,
      default: 256,
      dependencies: {
        fields: ['lossless'],
        handler: (data) => {
          return {
            disabled: data.lossless === true
          }
        }
      }
    }
  }
}
