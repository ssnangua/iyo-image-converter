export enum EXT_FORMAT {
  '.heic' = 'HEIF',
  '.heif' = 'HEIF',
  '.avif' = 'AVIF',
  '.jpeg' = 'JPEG',
  '.jpg' = 'JPEG',
  '.jpe' = 'JPEG',
  '.tile' = 'TILE',
  '.dz' = 'TILE',
  '.png' = 'PNG',
  '.raw' = 'RAW',
  '.tiff' = 'TIFF',
  '.tif' = 'TIFF',
  '.webp' = 'WEBP',
  '.gif' = 'GIF',
  '.jp2' = 'JP2',
  '.jpx' = 'JP2',
  '.j2k' = 'JP2',
  '.j2c' = 'JP2',
  '.jxl' = 'JXL',
  '.svg' = 'SVG',
  '.bmp' = 'BMP',
  '.ico' = 'ICO'
}

export enum FORMAT_EXT {
  HEIF = '.heif',
  AVIF = '.avif',
  JPEG = '.jpg',
  TILE = '.tile',
  PNG = '.png',
  RAW = '.raw',
  TIFF = '.tiff',
  WEBP = '.webp',
  GIF = '.gif',
  JP2 = '.jp2',
  JXL = '.jxl',
  SVG = '.svg',
  BMP = '.bmp',
  ICO = '.ico',
  APNG = '.png'
}

export const TYPES = [
  { label: '压缩', key: 'TINY' },
  { label: 'JPEG', key: 'JPEG' },
  { label: 'PNG', key: 'PNG' },
  { label: 'WEBP', key: 'WEBP' },
  { label: 'GIF', key: 'GIF' },
  { label: 'APNG', key: 'APNG' },
  { label: 'ICO', key: 'ICO' },
  { label: 'BMP', key: 'BMP' },
  { label: 'TIFF', key: 'TIFF' },
  { label: 'AVIF', key: 'AVIF' },
  { label: 'HEIF', key: 'HEIF' }
]

export const acceptInputRules = new RegExp(
  `\\.(${Object.keys(EXT_FORMAT).join('|').replace(/\./g, '')})$`,
  'i'
)

export const isAcceptInput = (file: string) => acceptInputRules.test(file)

export const isAnimeFormat = (format: string) =>
  format === 'gif' || format === 'apng' || format === 'webp'
