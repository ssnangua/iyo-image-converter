import fs from 'node:fs/promises'
import sharp from 'sharp'
import decode from 'decode-ico'
import { encode } from 'ico-endec'

export const decodeIco = decode
export const encodeIco = encode as (bufferList: Array<Buffer | ArrayBuffer>) => Buffer

export type IcoSharp = ReturnType<typeof decodeIco>[number] & {
  image: sharp.Sharp
}

export async function sharpsFromIco(
  input: string | Buffer,
  options?: sharp.SharpOptions | null,
  resolveWithObject = false
): Promise<IcoSharp[] | sharp.Sharp[]> {
  const buffer = typeof input === 'string' ? await fs.readFile(input) : input
  const icons = decodeIco(buffer).map((icon) => {
    const image =
      icon.type === 'png'
        ? sharp(icon.data, options || {})
        : sharp(icon.data, {
            ...options,
            raw: {
              width: icon.width,
              height: icon.height,
              channels: 4
            }
          })
    return { ...icon, image }
  })
  return resolveWithObject ? icons : icons.map((icon) => icon.image)
}

export type IcoOptions = {
  sizes?: number[] | 'default'
  resizeOptions?: sharp.ResizeOptions
}

async function resize(images: sharp.Sharp[], { sizes, resizeOptions }: IcoOptions) {
  if (sizes === 'default') {
    sizes = [256, 128, 64, 48, 32, 24, 16]
  } else if (!Array.isArray(sizes)) {
    return Promise.reject('sizes must be an array of number')
  }

  const resized: sharp.Sharp[] = []
  const sizeMap = <{ number: sharp.Sharp }>{}
  const imageSizes: number[] = []
  for (const image of images) {
    const { width } = await image.metadata()
    sizeMap[width] = image
    imageSizes.push(width)
  }
  imageSizes.sort((a, b) => a - b)
  sizes.forEach((size) => {
    const closestSize = imageSizes.find((v) => v > size) || imageSizes[imageSizes.length - 1]
    const image = sizeMap[closestSize].clone().resize({
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 },
      ...resizeOptions,
      width: size,
      height: size
    })
    resized.push(image)
  })
  return resized
}

export async function sharpsToIco(images: sharp.Sharp[], fileOut: string, options?: IcoOptions) {
  if (options) images = await resize(images, options)
  const bufferList = await Promise.all(
    images.map((image) => {
      return image.toFormat('png').toBuffer({ resolveWithObject: true })
    })
  )
  const icoBuffer = encodeIco(bufferList.map((buffer) => buffer.data))
  return fs.writeFile(fileOut, icoBuffer).then(() => {
    return {
      width: Math.max(...bufferList.map((buffer) => buffer.info.width)),
      height: Math.max(...bufferList.map((buffer) => buffer.info.height)),
      size: icoBuffer.length
    }
  })
}
