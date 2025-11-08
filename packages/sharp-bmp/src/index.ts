import fs from 'node:fs/promises'
import bmp from 'bmp-js'
import sharp from 'sharp'

function scan(bitmap: bmp.ImageData, f: (index: number) => void) {
  const w = Math.round(bitmap.width)
  const h = Math.round(bitmap.height)
  for (let _y = 0; _y < h; _y++) {
    for (let _x = 0; _x < w; _x++) {
      const index = (bitmap.width * _y + _x) << 2
      f.call(bitmap, index)
    }
  }
  return bitmap
}

function AGBR_to_RGBA(bitmap: bmp.BmpDecoder): bmp.ImageData {
  return scan(bitmap, (index) => {
    // const alpha = bitmap.data[index + 0]
    const blue = bitmap.data[index + 1]
    const green = bitmap.data[index + 2]
    const red = bitmap.data[index + 3]
    bitmap.data[index + 0] = red
    bitmap.data[index + 1] = green
    bitmap.data[index + 2] = blue
    bitmap.data[index + 3] = /* bitmap.is_with_alpha ? alpha :  */ 0xff
  })
}

function RGBA_to_AGBR(bitmap: bmp.ImageData): bmp.ImageData {
  return scan(bitmap, (index) => {
    const red = bitmap.data[index + 0]
    const green = bitmap.data[index + 1]
    const blue = bitmap.data[index + 2]
    const alpha = bitmap.data[index + 3]
    bitmap.data[index + 0] = alpha
    bitmap.data[index + 1] = blue
    bitmap.data[index + 2] = green
    bitmap.data[index + 3] = red
  })
}

/**
 * Decodes BMP image data
 *
 * @param bmpData - Buffer containing BMP image data
 * @returns Decoded image data
 */
export function decodeBmp(bmpData: Buffer): bmp.ImageData {
  return AGBR_to_RGBA(bmp.decode(bmpData))
}

/**
 * Encodes image data into BMP format
 *
 * @param bitmap - Image data
 * @returns Encoded BMP image data
 */
export function encodeBmp(bitmap: bmp.ImageData): bmp.ImageData {
  return bmp.encode(RGBA_to_AGBR(bitmap))
}

export type BmpSharp = bmp.ImageData & {
  image: sharp.Sharp
}

/**
 * Creates a Sharp instance from a BMP file or buffer
 *
 * @param input - BMP file path or Buffer
 * @param options - Options for Sharp
 * @param resolveWithObject - Whether to return an object containing metadata, defaults to false
 * @returns Promise<BmpSharp | sharp.Sharp> - When resolveWithObject is true, returns a composite object containing image data and Sharp instance, otherwise returns Sharp instance
 * @property image - Sharp instance.
 * @property data - Image Buffer.
 * @property width - Width of the BMP image.
 * @property height - Height of the BMP image.
 */
export async function sharpFromBmp(
  input: string | Buffer,
  options?: sharp.SharpOptions,
  resolveWithObject = false
): Promise<BmpSharp | sharp.Sharp> {
  const buffer = typeof input === 'string' ? await fs.readFile(input) : input
  const bitmap = decodeBmp(buffer)
  const image = sharp(bitmap.data, {
    ...options,
    raw: {
      width: bitmap.width,
      height: bitmap.height,
      channels: 4
    }
  })
  return resolveWithObject ? { ...bitmap, image } : image
}

export type BmpInfo = {
  width: number
  height: number
  size: number
}

/**
 * Write a Sharp instance to a BMP file
 *
 * @param image - Sharp instance
 * @param fileOut - Output file path
 * @returns Promise<BmpInfo> - Promise that resolves to an object containing the width, height, and size of the BMP file.
 * @property width - Width of the BMP image.
 * @property height - Height of the BMP image.
 * @property size - Size of the BMP file in bytes.
 * @throws
 */
export async function sharpToBmp(image: sharp.Sharp, fileOut: string): Promise<BmpInfo> {
  const { data, info } = await image
    .flatten({ background: '#ffffff' })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true })
  const bitmap = {
    data,
    width: info.width,
    height: info.height
  }
  const rawData = encodeBmp(bitmap)
  return fs.writeFile(fileOut, rawData.data).then(() => {
    return {
      width: info.width,
      height: info.height,
      size: rawData.data.length
    }
  })
}
