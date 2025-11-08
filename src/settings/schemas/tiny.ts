import { Schema } from '../Schema'

export interface TINY {
  JPEG: number
  PNG: number
  WEBP: number
  GIF: number
  APNG: number
  // ICO: number
  // BMP: number
  TIFF: number
  AVIF: number
  HEIF: number
}

export const TINYSchema: Schema = {
  name: 'TINY',
  type: 'object',
  properties: {
    JPEG: {
      title: 'JPEG 质量',
      type: 'number',
      component: 'Slider',
      step: 1,
      minimum: 1,
      maximum: 100,
      default: 80
    },
    PNG: {
      title: 'PNG 质量',
      type: 'number',
      component: 'Slider',
      step: 1,
      minimum: 0,
      maximum: 100,
      default: 80
    },
    WEBP: {
      title: 'WEBP 质量',
      type: 'number',
      component: 'Slider',
      step: 1,
      minimum: 1,
      maximum: 100,
      default: 80
    },
    GIF: {
      title: 'GIF 颜色数',
      type: 'number',
      component: 'Slider',
      step: 1,
      minimum: 2,
      maximum: 256,
      default: 256
    },
    APNG: {
      title: 'APNG 颜色数',
      type: 'number',
      component: 'Slider',
      step: 1,
      minimum: 1,
      maximum: 256,
      default: 256
    },
    // ICO: {
    //   title: 'ICO 质量',
    //   type: 'number',
    //   component: 'Unsupported'
    // },
    // BMP: {
    //   title: 'BMP 质量',
    //   type: 'number',
    //   component: 'Unsupported'
    // },
    TIFF: {
      title: 'TIFF 质量',
      type: 'number',
      component: 'Slider',
      step: 1,
      minimum: 1,
      maximum: 100,
      default: 80
    },
    AVIF: {
      title: 'AVIF 质量',
      type: 'number',
      component: 'Slider',
      step: 1,
      minimum: 1,
      maximum: 100,
      default: 50
    },
    HEIF: {
      title: 'HEIF 质量',
      type: 'number',
      component: 'Slider',
      step: 1,
      minimum: 1,
      maximum: 100,
      default: 50
    }
  }
}
