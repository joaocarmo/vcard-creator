import { readFileSync } from 'node:fs'

/** The sample JPEG image, base64 encoded. */
export const sampleImage = readFileSync(
  new URL('sample.jpg', import.meta.url),
  'base64',
)
