import { describe, expect, test } from '@jest/globals'
import { sharpsFromIco, sharpsToIco, type IcoSharp } from '../src/index'
import sharp from 'sharp'
import { fromFile } from 'file-type'
import path from 'node:path'
import fs from 'node:fs'

const f = (file: string) => path.resolve(__dirname, file)
const rm = (file: string) => fs.promises.unlink(file)

describe('🧪 测试：sharp-ico', () => {
  test('读取 ICO (PNG) 图片', async () => {
    const input = f('input-png.ico')
    const icons = await sharpsFromIco(input)
    expect(icons.length).toBe(3)
    const [icon] = (await sharpsFromIco(input, undefined, true)) as IcoSharp[]
    expect(icon.type === 'png').toBeTruthy()
  })

  test('读取 ICO (BMP) 图片', async () => {
    const input = f('input-bmp.ico')
    const [icon] = (await sharpsFromIco(input, undefined, true)) as IcoSharp[]
    expect(icon.type === 'bmp').toBeTruthy()
  })

  test('读取 ICO Buffer', async () => {
    const input = await fs.promises.readFile(f('input-png.ico'))
    const images = (await sharpsFromIco(input)) as sharp.Sharp[]
    expect(images.length).toBe(3)
  })

  test('写入 ICO 图片', async () => {
    const input32 = f('input-32.png')
    const input256 = f('input-256.png')

    const icoDef = f('tmp-def.ico')
    await sharpsToIco([sharp(input32)], icoDef)
    expect(await fromFile(icoDef)).toStrictEqual({ ext: 'ico', mime: 'image/x-icon' })
    await rm(icoDef)

    const ico256 = f('tmp-256.ico')
    await sharpsToIco([sharp(input32), sharp(input256)], ico256, { sizes: 'default' })
    expect(await fromFile(ico256)).toStrictEqual({ ext: 'ico', mime: 'image/x-icon' })
    await rm(ico256)

    const ico64 = f('tmp-64.ico')
    await sharpsToIco([sharp(input32)], ico64, { sizes: [64, 32, 16] })
    expect(await fromFile(ico64)).toStrictEqual({ ext: 'ico', mime: 'image/x-icon' })
    await rm(ico64)

    const icoErr = f('tmp-err.ico')
    await sharpsToIco([sharp(input32)], icoErr, { sizes: 'error' as any }).catch((e) => {
      expect(e).toBe('sizes must be an array of number')
    })
  })
})
