import { describe, expect, test } from '@jest/globals'
import { sharpFromBmp, sharpToBmp, type BmpSharp } from '../src/index'
import sharp from 'sharp'
import { fromFile } from 'file-type'
import path from 'node:path'
import fs from 'node:fs'

const f = (file: string) => path.resolve(__dirname, file)
const rm = (file: string) => fs.promises.unlink(file)

describe('🧪 测试：sharp-bmp', () => {
  test('读取 BMP 图片', async () => {
    const input = f('input.bmp')
    const fileOut = f('tmp.png')
    const image = (await sharpFromBmp(input)) as sharp.Sharp
    await image.toFile(fileOut)
    expect(await fromFile(fileOut)).toStrictEqual({ ext: 'png', mime: 'image/png' })
    await rm(fileOut)
  })

  test('读取 BMP 图片（返回详细信息）', async () => {
    const input = f('input.bmp')
    const fileOut = f('tmp.png')
    const { data, width, height, image } = (await sharpFromBmp(input, undefined, true)) as BmpSharp
    expect(data instanceof Buffer).toBeTruthy()
    expect(width).toBe(100)
    expect(height).toBe(100)
    await image.toFile(fileOut)
    expect(await fromFile(fileOut)).toStrictEqual({ ext: 'png', mime: 'image/png' })
    await rm(fileOut)
  })

  test('读取 BMP Buffer', async () => {
    const input = await fs.promises.readFile(f('input.bmp'))
    const fileOut = f('tmp.png')
    const image = (await sharpFromBmp(input)) as sharp.Sharp
    await image.toFile(fileOut)
    expect(await fromFile(fileOut)).toStrictEqual({ ext: 'png', mime: 'image/png' })
    await rm(fileOut)
  })

  test('写入 BMP 图片', async () => {
    const fileOut = f('tmp.bmp')
    const image = sharp(Buffer.from([255, 0, 0, 255]), {
      raw: {
        width: 1,
        height: 1,
        channels: 4
      }
    })
    await sharpToBmp(image, fileOut)
    expect(await fromFile(fileOut)).toStrictEqual({ ext: 'bmp', mime: 'image/bmp' })
    await rm(fileOut)
  })
})
