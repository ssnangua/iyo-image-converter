import {
  type General,
  type TINY,
  type JPEG,
  type PNG,
  type WEBP,
  type GIF,
  type APNG,
  type ICO,
  type BMP,
  type TIFF,
  type AVIF,
  type HEIF
} from './schemas'
import * as schemas from './schemas'
import { getSchemaDefaultValue } from './Schema'

export interface Settings {
  General: General
  TINY: TINY
  JPEG: JPEG
  PNG: PNG
  WEBP: WEBP
  GIF: GIF
  APNG: APNG
  ICO: ICO
  BMP: BMP
  TIFF: TIFF
  AVIF: AVIF
  HEIF: HEIF
}

// 默认设置
export function getDefaultSettings() {
  return Object.values(schemas).reduce((settings, schema) => {
    settings[schema.name!] = getSchemaDefaultValue(schema)
    return settings
  }, {} as Settings)
}
