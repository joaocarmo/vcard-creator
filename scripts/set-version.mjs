#!/usr/bin/env node

// Sets the version in package.json and LIB_VERSION from a release tag name,
// such as v1.2.3. Validates the tag and both files before it writes either.

import { readFileSync, writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

// SemVer 2.0 without build metadata: https://semver.org/#is-there-a-suggested-regular-expression-regex-to-check-a-semver-string
// npm drops build metadata on publish, so the published version would not
// match LIB_VERSION.
const SEMVER =
  /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?$/
const LIB_VERSION = /export const LIB_VERSION = '.*'/

function fail(message) {
  console.error(message)
  process.exit(1)
}

const tag = process.argv[2]

if (tag === undefined) {
  fail('Usage: node scripts/set-version.mjs <tag>, such as v1.2.3')
}

const version = tag.replace(/^v/, '')

if (!SEMVER.test(version)) {
  fail(
    `"${tag}" is not a SemVer version without build metadata, such as v1.2.3`,
  )
}

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const pkgFile = resolve(root, 'package.json')
const constantsFile = resolve(root, 'lib/constants.ts')

const pkg = JSON.parse(readFileSync(pkgFile, 'utf8'))
const constants = readFileSync(constantsFile, 'utf8')

if (!LIB_VERSION.test(constants)) {
  fail(`LIB_VERSION pattern not found in ${constantsFile}`)
}

pkg.version = version
writeFileSync(pkgFile, `${JSON.stringify(pkg, null, 2)}\n`)
writeFileSync(
  constantsFile,
  constants.replace(LIB_VERSION, `export const LIB_VERSION = '${version}'`),
)

console.log(`Version set to ${version}`)
