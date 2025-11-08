import { getRollupConfigs, clearDist } from './packages-base.js'
import { rollup } from 'rollup'
import terser from '@rollup/plugin-terser'

async function build() {
  const configs = await getRollupConfigs()

  for (const name in configs) {
    clearDist(name)

    const { inputOptions, outputOptionsList } = configs[name]

    console.log(`📦 正在打包：${name}`)
    const bundle = await rollup({
      input: inputOptions.input,
      plugins: [...inputOptions.plugins /* , terser() */],
      external: inputOptions.external,
      onwarn(warning, logging) {
        // 忽略 file-type 包的 eval 警告
        if (warning.id.includes('file-type') && warning.code === 'EVAL') {
          return
        }
        logging(warning)
      }
    })

    const tasks = []
    for (const output of outputOptionsList) {
      tasks.push(bundle.write(output))
    }

    await Promise.all(tasks)
    console.log(`✅ 打包完成：${name}`)
  }
}

build()
