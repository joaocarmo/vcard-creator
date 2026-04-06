#!/usr/bin/env node

import { readFileSync, writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const { version } = JSON.parse(
  readFileSync(resolve(root, 'package.json'), 'utf8'),
)
const file = resolve(root, 'lib/utils/constants.ts')

const src = readFileSync(file, 'utf8')
const pattern = /export const LIB_VERSION = '.*'/

if (!pattern.test(src)) {
  console.error(`LIB_VERSION pattern not found in ${file}`)
  process.exit(1)
}

const updated = src.replace(pattern, `export const LIB_VERSION = '${version}'`)

if (src === updated) {
  console.log(`LIB_VERSION already at ${version}`)
} else {
  writeFileSync(file, updated)
  console.log(`LIB_VERSION synced to ${version}`)
}
