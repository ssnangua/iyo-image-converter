import { Schema } from '../Schema'

export interface ICO {
  kernel: 'nearest' | 'cubic' | 'mitchell' | 'lanczos2' | 'lanczos3'
  includeSizes: number[]
}

export const ICOSchema: Schema = {
  name: 'ICO',
  type: 'object',
  properties: {
    kernel: {
      title: '缩放算法',
      type: 'string',
      enum: ['nearest', 'cubic', 'mitchell', 'lanczos2', 'lanczos3'],
      enumLabels: ['nearest', 'cubic', 'mitchell', 'lanczos2', 'lanczos3'],
      component: 'Select',
      default: 'lanczos3'
    },
    includeSizes: {
      title: '包含尺寸',
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
      default: [16, 24, 32, 48, 64, 72, 96, 128, 256]
    }
  }
}
