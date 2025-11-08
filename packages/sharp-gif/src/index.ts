import sharp from 'sharp'
import { GIFEncoder, quantize, applyPalette } from 'gifenc'

type ProgressHandler = (progress: { total: number; cutted?: number; encoded?: number }) => void

class GifReader {
  image: sharp.Sharp
  frames: sharp.Sharp[] = []

  constructor(image: sharp.Sharp) {
    this.image = image
  }

  async toFrames(progress: ProgressHandler = () => {}) {
    let { image } = this
    const { pages = 1, width, height, pageHeight = height } = await image.metadata()
    const frames: sharp.Sharp[] = []
    if (pages > 1) {
      image = sharp(await image.png().toBuffer())
      for (let i = 0; i < pages; i++) {
        progress({ cutted: i, total: pages })
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
    this.frames = frames
    return frames
  }

  async toGif(options = {}) {
    return new Gif(options).addFrame(this.frames || (await this.toFrames()))
  }
}

interface GifOptions {
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

class Gif {
  options: any
  frames: sharp.Sharp[] = []

  constructor(options: GifOptions = {}) {
    this.options = options
    this.frames = []
  }

  addFrame(frame: sharp.Sharp | sharp.Sharp[]) {
    if (Array.isArray(frame)) this.frames.push(...frame)
    else this.frames.push(frame)
    return this
  }

  getEncoder(options: GIFEncoder.Options = {}) {
    return new GIFEncoder(options)
  }

  async toBuffer(progress: ProgressHandler = () => {}, encoder?: GIFEncoder) {
    const { options, frames } = this
    let {
      width,
      height,
      delay = [],
      repeat = 0,
      transparent = false,
      maxColors = 256,
      format = 'rgb565',
      resizeTo = 'largest',
      resizeType = 'zoom',
      resizeOptions = {},
      extendBackground = { r: 0, g: 0, b: 0, alpha: 0 },
      rawOptions,
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

    // Exclude inside and outside fit
    const { fit } = resizeOptions
    if (fit === 'inside' || fit === 'outside') {
      resizeOptions.fit = 'contain'
    }

    const cutted: sharp.Sharp[] = []

    // Parse frames
    for (let i = 0; i < frames.length; i++) {
      cutted.push(...(await new GifReader(frames[i]).toFrames()))
    }

    // Get width and height of output gif
    if (!width || !height) {
      const meta = await Promise.all(frames.map((frame) => frame.metadata()))
      const math = resizeTo === 'largest' ? Math.max : Math.min
      width = width || math(...meta.map((m) => m.width))
      height = height || math(...meta.map((m) => m.pageHeight || m.height))
    }

    // Get GifEncoder
    if (!encoder) {
      encoder = GIFEncoder(gifEncoderOptions)
    }

    // Write out frames
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
      const data = new Uint8ClampedArray(buffer)
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

      // Call progress handler
      progress({ total: cutted.length, encoded: i + 1 })
    }

    // Write end-of-stream character
    encoder.finish()

    return encoder.bytes()
  }

  async toSharp(progress: ProgressHandler = () => {}, encoder?: GIFEncoder) {
    const buffer = await this.toBuffer(progress, encoder)
    return sharp(buffer, {
      animated: true,
      ...this.options.sharpOptions
    }).gif({
      loop: this.options.repeat || 0,
      delay: this.options.delay
    })
  }
}

export function createGif(options: GifOptions = {}) {
  return new Gif(options)
}

export function readGif(image: sharp.Sharp) {
  return new GifReader(image)
}
