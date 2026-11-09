import { spawnSync } from 'node:child_process'
import {
  copyFileSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { check, resolveConfig } from 'prettier'

const repoRoot = resolve(import.meta.dirname, '..')
const files = ['scripts/set-version.mjs', 'package.json', 'lib/constants.ts']

let root: string

const read = (file: string) => readFileSync(join(root, file), 'utf8')
const run = (...args: string[]) =>
  spawnSync(
    process.execPath,
    [join(root, 'scripts/set-version.mjs'), ...args],
    { encoding: 'utf8' },
  )

beforeEach(() => {
  root = mkdtempSync(join(tmpdir(), 'set-version-'))
  mkdirSync(join(root, 'scripts'))
  mkdirSync(join(root, 'lib'))
  for (const file of files) {
    copyFileSync(join(repoRoot, file), join(root, file))
  }
})

afterEach(() => {
  rmSync(root, { recursive: true, force: true })
})

describe('set-version', () => {
  it.each([
    ['v1.2.3', '1.2.3'],
    ['1.2.3', '1.2.3'],
    ['v1.2.3-beta.1', '1.2.3-beta.1'],
  ])('should set the version from %s', (tag, version) => {
    const result = run(tag)

    expect(result.status).toBe(0)
    expect(JSON.parse(read('package.json')).version).toBe(version)
    expect(read('lib/constants.ts')).toContain(
      `export const LIB_VERSION = '${version}'`,
    )
  })

  it('should keep the other package.json fields and its format', async () => {
    const before = JSON.parse(read('package.json'))

    run('v9.8.7')

    const after = read('package.json')
    const filepath = join(repoRoot, 'package.json')
    expect(JSON.parse(after)).toEqual({ ...before, version: '9.8.7' })
    expect(
      await check(after, { ...(await resolveConfig(filepath)), filepath }),
    ).toBe(true)
  })

  it.each(['1.2', 'vx.y.z', '01.2.3', '1.2.3+build.5', ''])(
    'should reject the tag "%s" and change no file',
    (tag) => {
      const pkg = read('package.json')
      const constants = read('lib/constants.ts')

      const result = run(tag)

      expect(result.status).toBe(1)
      expect(read('package.json')).toBe(pkg)
      expect(read('lib/constants.ts')).toBe(constants)
    },
  )

  it('should exit with an error without a tag', () => {
    const pkg = read('package.json')

    const result = run()

    expect(result.status).toBe(1)
    expect(result.stderr).toContain('Usage')
    expect(read('package.json')).toBe(pkg)
  })

  it('should change no file when LIB_VERSION is missing', () => {
    const pkg = read('package.json')
    writeFileSync(join(root, 'lib/constants.ts'), "export const OTHER = 'x'\n")

    const result = run('v1.2.3')

    expect(result.status).toBe(1)
    expect(read('package.json')).toBe(pkg)
  })
})
