import path from 'node:path'
import URL from 'node:url'
import fs from 'node:fs'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import typescript from 'rollup-plugin-typescript2'

const __filename = URL.fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const packages = ['sharp-bmp', 'sharp-ico', 'sharp-gif', 'sharp-apng', 'sharp-extra']

function getPackageRoots() {
  return packages.map((pkg) => path.resolve(__dirname, `../packages/`, pkg))
}

async function packageJson(root) {
  const jsonPath = path.resolve(root, 'package.json')
  const content = await fs.promises.readFile(jsonPath, 'utf8')
  return JSON.parse(content)
}

async function getRollupConfig(root) {
  const pkg = await packageJson(root)
  const input = path.resolve(root, './src/index.ts')
  const dist = path.resolve(root, './dist')
  const tsconfig = path.resolve(root, 'tsconfig.json')

  const formats = ['esm', 'cjs']
  const external = [
    'sharp',
    '@ssnangua/sharp-bmp',
    '@ssnangua/sharp-ico',
    '@ssnangua/sharp-gif',
    '@ssnangua/sharp-apng'
  ]
  const manualChunks = {}
  Object.keys(pkg.dependencies).forEach((dep) => {
    if (!external.includes(dep)) {
      manualChunks[dep] = [dep]
    }
  })

  const inputOptions = {
    input,
    external,
    plugins: [
      typescript({
        tsconfig
      }),
      nodeResolve(),
      commonjs()
    ],
    watch: {
      include: path.resolve(root, 'src/**'),
      exclude: path.resolve(root, 'node_modules/**')
    }
  }

  const outputOptionsList = formats.map((format) => ({
    format,
    // file: path.resolve(dist, `index.${format}.js`),
    dir: dist,
    entryFileNames: `[name].${format}.js`,
    sourcemap: true,
    manualChunks,
    chunkFileNames: `[name].${format}.js`
  }))

  return { inputOptions, outputOptionsList }
}

export async function getRollupConfigs() {
  const roots = getPackageRoots()
  const configs = await Promise.all(roots.map(getRollupConfig))
  const result = {}
  for (let i = 0; i < packages.length; i++) {
    result[packages[i]] = configs[i]
  }
  return result
}

export function clearDist(name) {
  const dist = path.resolve(__dirname, `../packages/${name}/dist`)
  if (fs.existsSync(dist)) {
    fs.rmSync(dist, { recursive: true, force: true })
  }
}
