import fs from 'node:fs'
import sharp from 'sharp'
import { GIFEncoder, quantize, applyPalette } from 'gifenc'
import upng from 'upng-js'

/**
 * Cut frames from animated sharp
 */
async function getFrames(image: sharp.Sharp) {
  const { pages = 1, width, height, pageHeight = height } = await image.metadata()
  const frames: sharp.Sharp[] = []
  if (pages > 1) {
    image = sharp(await image.png().toBuffer())
    for (let i = 0; i < pages; i++) {
      const frame = image.clone().extract({
        left: 0,
        top: pageHeight * i,
        width: width,
        height: pageHeight
      })
      frames.push(sharp(await frame.toBuffer()))
    }
  } else {
    frames.push(image)
  }
  return frames
}

/**
 * Decode APNG image
 */
function decodeApng(input: string | Buffer) {
  const buffer = typeof input === 'string' ? fs.readFileSync(input) : input
  const decoder = upng.decode(buffer as any)
  const { width, height, depth, ctype } = decoder
  const delay = decoder.frames.map((frame) => frame.delay)
  const frames = upng.toRGBA8(decoder).map((frame) => Buffer.from(frame))
  return { width, height, depth, ctype, delay, pages: frames.length, frames }
}

export interface GifOptions {
  sharpOptions?: sharp.SharpOptions
  width?: number
  height?: number
  delay?: number | number[]
  repeat?: number
  transparent?: boolean
  maxColors?: number
  format?: 'rgb565' | 'rgb444' | 'rgba4444'
  resizeTo?: 'largest' | 'smallest'
  resizeType?: 'zoom' | 'crop'
  resizeOptions?: sharp.ResizeOptions
  extendBackground?: sharp.Color
  gifEncoderOptions?: GIFEncoder.Options
  gifEncoderQuantizeOptions?: quantize.Options
  gifEncoderFrameOptions?: GIFEncoder.FrameOptions
}

/**
 * Encode animated GIF
 * sharp does not support APNG encoding,
 * nor creates animated instance from frames,
 * so we have to convert to GIF encoded buffer.
 */
function encodeGif(frames: Buffer[], options: GifOptions = {}) {
  let {
    width,
    height,
    delay = [],
    repeat = 0,
    transparent = false,
    maxColors = 256,
    format = 'rgb565',
    gifEncoderOptions = {},
    gifEncoderQuantizeOptions = {},
    gifEncoderFrameOptions = {}
  } = options

  if (typeof delay === 'number') {
    delay = new Array(frames.length).fill(delay)
  }
  if (repeat === 1) {
    repeat = -1
  }

  const encoder = GIFEncoder(gifEncoderOptions)

  // Write out frames
  frames.forEach((frame, i) => {
    const data = new Uint8ClampedArray(frame)
    const palette = quantize(data, maxColors, {
      format,
      ...gifEncoderQuantizeOptions
    })
    const index = applyPalette(data, palette, format)
    encoder.writeFrame(index, width, height, {
      transparent,
      delay: delay[i],
      repeat,
      ...gifEncoderFrameOptions,
      palette
    })
  })

  // Write out footer bytes.
  encoder.finish()

  return encoder.bytes()
}

/**
 * Create instances of sharp from APNG frames.
 */
export function framesFromApng(input: string | Buffer, resolveWithObject = false) {
  const apng = decodeApng(input)
  const frames = apng.frames.map((frame) => {
    return sharp(frame, {
      raw: {
        width: apng.width,
        height: apng.height,
        channels: 4
      }
    })
  })
  return resolveWithObject ? { ...apng, frames } : frames
}

/**
 * Create an instance of animated sharp from an APNG image
 */
export async function sharpFromApng(
  input: string | Buffer,
  options: GifOptions = {},
  resolveWithObject = false
) {
  const apng = decodeApng(input)
  const gifBuffer = encodeGif(apng.frames, {
    width: apng.width,
    height: apng.height,
    ...options
  })
  const image = sharp(gifBuffer, {
    animated: true,
    ...options.sharpOptions
  }).gif({
    loop: options.repeat || 0,
    delay: options.delay || apng.delay
  })
  return resolveWithObject ? { ...apng, image } : image
}

export interface ApngOptions {
  width?: number
  height?: number
  cnum?: number
  delay?: number | number[]
  resizeTo?: 'largest' | 'smallest'
  resizeType?: 'zoom' | 'crop'
  resizeOptions?: sharp.ResizeOptions
  extendBackground?: sharp.Color
  rawOptions?: sharp.RawOptions
}

/**
 * Write an APNG file from an array of instances of sharp
 */
export async function framesToApng(
  images: sharp.Sharp[],
  fileOut: string,
  options: ApngOptions = {}
) {
  let {
    width,
    height,
    cnum = 0,
    delay: oDelay = [],
    resizeTo = 'largest',
    resizeType = 'zoom',
    resizeOptions = {},
    extendBackground = { r: 0, g: 0, b: 0, alpha: 0 },
    rawOptions
  } = options

  if (typeof oDelay === 'number') {
    oDelay = new Array(images.length).fill(oDelay)
  }

  const bufferList: ArrayBuffer[] = []
  const delayList: number[] = []
  const cutted: sharp.Sharp[] = []

  // Get width and height of output gif
  let meta
  if (!width || !height) {
    meta = await Promise.all(images.map((frame) => frame.metadata()))
    const math = resizeTo === 'largest' ? Math.max : Math.min
    width = width || math(...meta.map((m) => m.width))
    height = height || math(...meta.map((m) => m.pageHeight || m.height))
  }

  // Parse frames
  for (let i = 0; i < images.length; i++) {
    const frame = images[i]
    const { pages, delay } = meta?.[i] || (await frame.metadata())
    if (pages > 1) {
      const frames = await getFrames(frame)
      cutted.push(...frames)
      delayList.push(...delay)
    } else {
      cutted.push(frame)
      delayList.push(oDelay[i] || 0)
    }
  }

  // Get frames buffer
  for (let i = 0; i < cutted.length; i++) {
    const frame = cutted[i]
    const { width: frameWidth, height: frameHeight } = await frame.metadata()
    if (frameWidth !== width || frameHeight !== height) {
      // Resize frame
      if (resizeType === 'zoom') {
        frame.resize({
          ...resizeOptions,
          width,
          height
        })
      }
      // Extend or extract frame
      else {
        const halfWidth = Math.abs(width - frameWidth) / 2
        if (frameWidth < width) {
          frame.extend({
            left: halfWidth,
            right: halfWidth,
            background: extendBackground
          })
        } else if (frameWidth > width) {
          frame.extract({ left: halfWidth, top: 0, width, height })
        }
        const halfHeight = Math.abs(height - frameHeight) / 2
        if (frameHeight < height) {
          frame.extend({
            top: halfHeight,
            bottom: halfHeight,
            background: extendBackground
          })
        } else if (frameHeight > height) {
          frame.extract({ left: 0, top: halfHeight, width, height })
        }
      }
    }

    const { buffer } = await frame.ensureAlpha().raw(rawOptions).toBuffer()
    bufferList.push(buffer as ArrayBuffer)
  }

  const buffer = Buffer.from(upng.encode(bufferList, width, height, cnum, delayList))
  fs.writeFileSync(fileOut, buffer)
  return { width, height, size: buffer.length }
}

/**
 * Write an APNG file from an animated sharp
 */
export async function sharpToApng(image: sharp.Sharp, fileOut: string, options: ApngOptions = {}) {
  const frames = await getFrames(image)
  const { delay } = await image.metadata()
  return framesToApng(frames, fileOut, { delay, ...options })
}
