import { describe, expect, test } from '@jest/globals'
import { createGif, readGif } from '../src/index'
import sharp from 'sharp'
import { fromFile } from 'file-type'
import path from 'node:path'
import fs from 'node:fs'

const f = (file: string) => path.resolve(__dirname, file)
const rm = (file: string) => fs.promises.unlink(file)

describe('🧪 测试：sharp-gif', () => {
  test('读取 GIF 图片', async () => {
    const reader = readGif(sharp(f('./2.gif'), { animated: true }))
    const frames = await reader.toFrames()
    for (let i = 0; i < frames.length; i++) {
      const frame = frames[i]
      const fileOut = f(`./${String(i).padStart(4, '0')}.png`)
      await frame.toFile(fileOut)
      expect(await fromFile(fileOut)).toStrictEqual({ ext: 'png', mime: 'image/png' })
      await rm(fileOut)
    }

    const fileOut = f('./remake.gif')
    const gif = await reader.toGif({
      transparent: true,
      maxColors: 32,
      format: 'rgb444'
    })
    const image = await gif.toSharp(() => {}, gif.getEncoder({}))
    await image.toFile(fileOut)
    expect(await fromFile(fileOut)).toStrictEqual({ ext: 'gif', mime: 'image/gif' })
    await rm(fileOut)
  })

  test('创建 GIF 图片', async () => {
    const fileOut = f('frames.gif')
    const frames = fs.readdirSync(f('./frames')).map((file) => sharp(f(`./frames/${file}`)))
    const image = await createGif({
      width: 100,
      delay: 100,
      repeat: 1,
      resizeType: 'zoom',
      resizeOptions: {
        fit: 'inside'
      }
    })
      .addFrame(frames[0])
      .addFrame(frames.slice(1))
      .toSharp()
    await image.toFile(fileOut)
    expect(await fromFile(fileOut)).toStrictEqual({ ext: 'gif', mime: 'image/gif' })
    await rm(fileOut)
  })

  test('拼接 GIF 图片', async () => {
    const fileOut = f('concat.gif')
    const image = await createGif({
      transparent: true,
      maxColors: 32,
      format: 'rgb444'
    })
      .addFrame([
        sharp(f('./1.gif'), { animated: true }),
        sharp(f('./2.gif'), { animated: true }),
        sharp(f('./3.gif'), { animated: true })
      ])
      .toSharp()
    await image.toFile(fileOut)
    expect(await fromFile(fileOut)).toStrictEqual({ ext: 'gif', mime: 'image/gif' })
    await rm(fileOut)
  })
})
