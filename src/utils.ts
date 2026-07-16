import { createHash } from 'node:crypto'
import process from 'node:process'
import { loadEnv } from 'vite'

/**
 * @deprecated Use the resolved mode from Vite's `configResolved` hook instead.
 */
export function getEnvMode(): string {
  const script = process.env.npm_lifecycle_script as string
  const reg = /(?:^|\s)--mode(?:\s+|=)(["']?)([\w.-]+)\1(?=\s|$)/i
  const result = reg.exec(script)
  let mode = 'production'
  if (result) {
    mode = result[2] as string
  }

  return mode
}

export function getConfigSource(varName: string, match: string, envDir: string, mode: string, envPrefix?: string | string[]): string {
  const reg = new RegExp(`^(${match})`)

  const config = loadEnv(mode, envDir, envPrefix)
  Object.keys(config).forEach((key) => {
    if (!reg.test(key)) {
      Reflect.deleteProperty(config, key)
    }
  })

  const windowVariable = `window.${varName}`
  // 确保变量不会被修改
  let source = `${windowVariable}=${JSON.stringify(config)};`
  source += `
    Object.freeze(${windowVariable});
    Object.defineProperty(window, "${varName}", {
      configurable: false,
      writable: false,
    });
  `.replaceAll(/\s/g, '')
  return source
}

export function ensureTrailingSlash(path: string): string {
  return path.endsWith('/') ? path : `${path}/`
}

/**
 * 生产基于内容的 hash，可自定义长度
 * @param content
 * @param hashLSize
 */
export function generatorContentHash(content: string, hashLSize?: number): string {
  const hash = createHash('md5').update(content, 'utf8').digest('hex')

  if (hashLSize) {
    return hash.slice(0, hashLSize)
  }

  return hash
}
