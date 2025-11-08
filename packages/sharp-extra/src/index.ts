import fs from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'
// why not the latest version of file-type?
//   see https://github.com/sindresorhus/file-type/issues/535#issuecomment-1085818733
import { fromFile, fromBuffer, type FileTypeResult } from 'file-type'
import { sharpFromBmp, sharpToBmp } from '@ssnangua/sharp-bmp'
import { sharpsFromIco, sharpsToIco, type IcoOptions } from '@ssnangua/sharp-ico'
import { readGif } from '@ssnangua/sharp-gif'
import { sharpFromApng, sharpToApng, type ApngOptions } from '@ssnangua/sharp-apng'

declare namespace sharpExtra {
  export type getImageInfo = (file: string) => Promise<sharpExtra.ImageInfo>
  export type ImageInfo = {
    location: string
    dir: string
    base: string
    name: string
    ext: string
    mime: string
    type: string
    size: number
    mtime: Date
    width?: number
    height?: number
    density?: number
    pages?: number
  }
}

const FILE_TYPE: { [key: string]: FileTypeResult } = {
  BMP: { ext: 'bmp', mime: 'image/bmp' },
  ICO: { ext: 'ico', mime: 'image/x-icon' },
  GIF: { ext: 'gif', mime: 'image/gif' },
  WEBP: { ext: 'webp', mime: 'image/webp' },
  APNG: { ext: 'apng', mime: 'image/apng' }
}

class SharpExtra {
  #input: string | Buffer
  #options?: sharp.SharpOptions
  #extraOptions: any

  #fileType?: FileTypeResult
  #sharp?: sharp.Sharp
  #frames: sharp.Sharp[] = []

  get sharp() {
    return this.#sharp
  }
  get frames() {
    return this.#frames
  }

  constructor(input: string | Buffer, options?: sharp.SharpOptions, extraOptions?: any) {
    this.#input = input
    this.#options = options
    this.#extraOptions = extraOptions
  }

  async init() {
    const fileTypeFrom = typeof this.#input === 'string' ? fromFile : fromBuffer
    this.#fileType = await fileTypeFrom(this.#input as any)
    if (!this.#fileType) throw new Error('Unsupported format')

    switch (this.#fileType.mime) {
      case FILE_TYPE.BMP.mime: {
        this.#sharp = (await sharpFromBmp(this.#input, this.#options)) as sharp.Sharp
        this.#frames = [this.#sharp]
        break
      }
      case FILE_TYPE.ICO.mime: {
        this.#frames = (await sharpsFromIco(this.#input, this.#options)) as sharp.Sharp[]
        this.#sharp = this.#frames[0]
        break
      }
      case FILE_TYPE.GIF.mime:
      case FILE_TYPE.WEBP.mime: {
        this.#sharp = sharp(this.#input, { ...this.#options, animated: true })
        this.#frames = (await readGif(this.#sharp).toFrames()) as sharp.Sharp[]
        break
      }
      case FILE_TYPE.APNG.mime: {
        const { image, frames } = (await sharpFromApng(this.#input, {}, true)) as {
          image: sharp.Sharp
          frames: Buffer[]
        }
        this.#sharp = image
        this.#frames = frames.map((frame) => sharp(frame))
        break
      }
      default:
        this.#sharp = sharp(this.#input, this.#options)
        this.#frames = [this.#sharp]
    }
  }

  bmp(): SharpExtra {
    this.#fileType = FILE_TYPE.BMP
    return this
  }

  ico(options: IcoOptions = {}): SharpExtra {
    this.#fileType = FILE_TYPE.ICO
    this.#extraOptions = options
    return this
  }

  apng(options: ApngOptions = {}): SharpExtra {
    this.#fileType = FILE_TYPE.APNG
    this.#extraOptions = options
    return this
  }

  toFormat(format: any, options?: any): SharpExtra {
    switch (format) {
      case 'bmp':
        this.bmp()
        break
      case 'ico':
        this.ico(options)
        break
      case 'apng':
        this.apng(options)
        break
      default:
        this.#sharp!.toFormat(format, options)
    }
    return this
  }

  toFile(fileOut: string) {
    switch (path.extname(fileOut).toLowerCase()) {
      case '.bmp':
        return sharpToBmp(this.#sharp!, fileOut)
      case '.ico':
        return sharpsToIco(this.#frames, fileOut, this.#extraOptions)
      case '.png': {
        if (this.#fileType?.mime === FILE_TYPE.APNG.mime && this.#frames.length > 1) {
          return sharpToApng(this.#sharp!, fileOut, this.#extraOptions)
        }
      }
      default: {
        return this.#sharp!.toFile(fileOut)
      }
    }
  }

  async toFrameFiles(fileOut: string, newFolder = false) {
    let { dir, name, ext } = path.parse(fileOut)
    if (newFolder) {
      dir = path.join(dir, name)
      await fs.mkdir(dir, { recursive: true })
    }

    const files: string[] = []
    for (let i = 0; i < this.#frames.length; i++) {
      const frame = this.#frames[i]

      let filename: string
      if (this.#fileType?.mime === FILE_TYPE.ICO.mime) {
        const { width } = await frame.metadata()
        filename = `${name}_${width}${ext}`
      } else {
        filename = `${name}_${i}${ext}`
      }
      const file = path.join(dir, filename)

      switch (ext.toLowerCase()) {
        case '.bmp': {
          await sharpToBmp(frame, file)
          break
        }
        case '.ico': {
          await sharpsToIco([frame], file, this.#extraOptions)
          break
        }
        default: {
          await frame.toFile(file)
        }
      }

      files.push(file)
    }

    return files
  }

  timeout(options: sharp.TimeoutOptions) {
    this.#sharp!.timeout(options)
    this.#frames.forEach((frame) => frame.timeout(options))
    return this
  }
}

async function sharpExtra(
  input: string | Buffer,
  options?: sharp.SharpOptions,
  extraOptions?: any
): Promise<SharpExtra> {
  const instance = new SharpExtra(input, options, extraOptions)
  await instance.init()
  return instance
}
sharpExtra.sharp = sharp
sharpExtra.SharpExtra = SharpExtra

export default sharpExtra

sharpExtra.getImageInfo = async (file: string) => {
  const fileType = await fromFile(file)
  if (!fileType) return Promise.reject(new Error('Unsupported format'))

  const { ext, mime } = fileType
  const stat = await fs.stat(file)
  const image = await sharpExtra(file)
  const metadata = await image.sharp!.metadata()
  const pages = image.frames.length
  const { dir, base, name } = path.parse(file)
  return {
    location: file,
    dir,
    base,
    name,
    ext,
    mime,
    type: ext.toUpperCase(),
    size: stat.size,
    mtime: stat.mtime,
    width: metadata.width,
    height: metadata.height,
    density: metadata.density,
    pages: pages || metadata.pages
  }
}
