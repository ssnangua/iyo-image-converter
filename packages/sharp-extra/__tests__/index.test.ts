import { describe, expect, test } from '@jest/globals'
import sharpExtra from '../src/index'
import { fromFile } from 'file-type'
import path from 'node:path'
import fs from 'node:fs'

const f = (file: string) => path.resolve(__dirname, file)
const rm = (file: string) => fs.promises.unlink(file)

describe('🧪 测试：sharp-extra', () => {
  const pngType = { ext: 'png', mime: 'image/png' }
  const bmpType = { ext: 'bmp', mime: 'image/bmp' }
  const icoType = { ext: 'ico', mime: 'image/x-icon' }
  const gifType = { ext: 'gif', mime: 'image/gif' }
  const apngType = { ext: 'apng', mime: 'image/apng' }

  test('BMP 转 PNG', async () => {
    const input = f('input.bmp')
    const fileOut = f('tmp.png')

    let image = await sharpExtra(input)
    await image.toFile(fileOut)
    expect(await fromFile(fileOut)).toStrictEqual(pngType)
    // await rm(fileOut)

    image = await sharpExtra(await fs.promises.readFile(input))
    await image.toFile(fileOut)
    expect(await fromFile(fileOut)).toStrictEqual(pngType)
    // await rm(fileOut)
  })

  test('PNG 转 BMP', async () => {
    const input = f('input.png')
    const fileOut = f('tmp.bmp')
    const image = await sharpExtra(input)
    await image.toFile(fileOut)
    expect(await fromFile(fileOut)).toStrictEqual(bmpType)
    await rm(fileOut)
  })

  test('ICO 转 PNG', async () => {
    const input = f('input.ico')
    const fileOut = f('tmp.png')
    const image = await sharpExtra(input)
    await image.toFile(fileOut)
    expect(await fromFile(fileOut)).toStrictEqual(pngType)
    await rm(fileOut)
  })

  test('PNG 转 ICO', async () => {
    const input = f('input.png')
    const fileOut = f('tmp.ico')
    const image = await sharpExtra(input)
    await image.toFile(fileOut)
    expect(await fromFile(fileOut)).toStrictEqual(icoType)
    await rm(fileOut)
  })

  test('GIF 转 APNG', async () => {
    const input = f('animated.gif')
    const fileOut = f('tmp-animated.png')
    const image = await sharpExtra(input)
    await image.apng().toFile(fileOut)
    expect(await fromFile(fileOut)).toStrictEqual(apngType)
    await rm(fileOut)
  })

  test('APNG 转 GIF', async () => {
    const input = f('animated.png')
    const fileOut = f('tmp-animated.gif')
    const image = await sharpExtra(input)
    await image.toFile(fileOut)
    expect(await fromFile(fileOut)).toStrictEqual(gifType)
    await rm(fileOut)
  })

  test('无效文件', async () => {
    await sharpExtra(Buffer.from([])).catch((err) => {
      expect(err.message).toStrictEqual('Unsupported format')
    })
  })
})
