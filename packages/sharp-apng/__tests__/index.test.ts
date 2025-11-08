import { describe, expect, test } from '@jest/globals'
import { sharpFromApng, sharpToApng, framesFromApng, framesToApng } from '../src/index'
import sharp from 'sharp'
import { fromFile } from 'file-type'
import path from 'node:path'
import fs from 'node:fs'

const f = (file: string) => path.resolve(__dirname, file)
const rm = (file: string) => fs.promises.unlink(file)

describe('🧪 测试：sharp-apng', () => {
  test('读取 APNG 图片', async () => {
    const input = f('animated.png')
    const fileOut = f('tmp.gif')
    const image = (await sharpFromApng(input)) as sharp.Sharp
    await image.toFile(fileOut)
    expect(await fromFile(fileOut)).toStrictEqual({ ext: 'gif', mime: 'image/gif' })
    await rm(fileOut)
  })

  test('写入 APNG 图片', async () => {
    const input = f('animated.gif')
    const fileOut = f('tmp.png')
    const image = sharp(input, { animated: true })
    await sharpToApng(image, fileOut)
    expect(await fromFile(fileOut)).toStrictEqual({ ext: 'apng', mime: 'image/apng' })
    await rm(fileOut)
  })
})
