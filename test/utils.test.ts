import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import process from 'node:process'
import { afterEach, describe, expect, it } from 'vitest'
import { getConfigSource, getEnvMode } from '../src/utils'

const originalLifecycleScript = process.env.npm_lifecycle_script
const originalEnvFile = process.env.VITE_GLOB_ENV_FILE
let envDir: string | undefined

afterEach(async () => {
  if (envDir) {
    await rm(envDir, { force: true, recursive: true })
    envDir = undefined
  }

  if (originalLifecycleScript === undefined) {
    Reflect.deleteProperty(process.env, 'npm_lifecycle_script')
  }
  else {
    process.env.npm_lifecycle_script = originalLifecycleScript
  }

  if (originalEnvFile === undefined) {
    Reflect.deleteProperty(process.env, 'VITE_GLOB_ENV_FILE')
  }
  else {
    process.env.VITE_GLOB_ENV_FILE = originalEnvFile
  }
})

describe('getEnvMode (deprecated)', () => {
  it.each([
    ['vite build', 'production'],
    ['vite build --mode development', 'development'],
    ['vite build --mode production-canary', 'production-canary'],
    ['vite build --mode production.east', 'production.east'],
    ['vite build --mode production_east', 'production_east'],
    ['vite build --mode=production-canary', 'production-canary'],
    ['vite build --mode "production-canary"', 'production-canary'],
    ['vite build --mode \'production-canary\'', 'production-canary'],
    ['vite build --mode analyze', 'analyze'],
  ])('parses %s', (script, expectedMode) => {
    process.env.npm_lifecycle_script = script

    expect(getEnvMode()).toBe(expectedMode)
  })
})

describe('getConfigSource', () => {
  it.each([
    'production-canary',
    'production.east',
    'production_east',
  ])('loads the matching .env.%s file', async (mode) => {
    envDir = await mkdtemp(join(tmpdir(), 'vite-extra-app-config-'))
    await writeFile(join(envDir, '.env.production'), 'VITE_GLOB_ENV_FILE=.env.production\n')
    await writeFile(join(envDir, `.env.${mode}`), `VITE_GLOB_ENV_FILE=.env.${mode}\n`)
    process.env.npm_lifecycle_script = 'vite build --mode production'

    const source = getConfigSource('__APP_ENV__', 'VITE_GLOB_', envDir, mode, 'VITE_')

    expect(source).toContain(`"VITE_GLOB_ENV_FILE":".env.${mode}"`)
  })
})
