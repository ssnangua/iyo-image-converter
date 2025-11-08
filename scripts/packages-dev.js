import { getRollupConfigs } from './packages-base.js'
import { watch } from 'rollup'

async function dev() {
  const configs = await getRollupConfigs()
  for (const name in configs) {
    const { inputOptions, outputOptionsList } = configs[name]

    const watcher = watch({
      ...inputOptions,
      output: outputOptionsList
    })

    watcher.on('event', (event) => {
      if (event.code === 'START') {
        console.log(`👀 开始监听：${name}`)
      } else if (event.code === 'ERROR') {
        console.error(`❌ ${name} 打包失败：`, event.error)
      } else if (event.code === 'BUNDLE_START') {
        console.log(`📦 正在打包：${name}`)
      } else if (event.code === 'BUNDLE_END') {
        console.log(`✅ 打包完成：${name}`)
      }
    })
  }
}

dev()
