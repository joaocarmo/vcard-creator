import VCardException from './VCardException.js'
import { PROPERTIES, type PropertyInput } from './properties.js'
import type { LogoOptions, PhotoOptions } from './types/VCard.js'
import { assertString, showValue } from './validate.js'

export const DEFAULT_MIME_TYPE = 'JPEG'

/**
 * IANA registered image MIME types, from
 * https://www.iana.org/assignments/media-types/image.csv on 2026-11-09.
 * Entries are lower case, because the lookup lower-cases its input, and sorted,
 * so a refresh is easy to diff.
 *
 * @link https://www.iana.org/assignments/media-types/media-types.xhtml#image
 */
export const MIME_TYPES: ReadonlySet<string> = new Set([
  'aces',
  'apng',
  'avci',
  'avcs',
  'avif',
  'bmp',
  'cgm',
  'dicom-rle',
  'dpx',
  'emf',
  'fits',
  'g3fax',
  'gif',
  'heic',
  'heic-sequence',
  'heif',
  'heif-sequence',
  'hej2k',
  'hsj2',
  'ief',
  'j2c',
  'jaii',
  'jais',
  'jls',
  'jp2',
  'jpeg',
  'jph',
  'jphc',
  'jpm',
  'jpx',
  'jxl',
  'jxr',
  'jxra',
  'jxrs',
  'jxs',
  'jxsc',
  'jxsi',
  'jxss',
  'ktx',
  'ktx2',
  'naplps',
  'png',
  'prs.aimg',
  'prs.btif',
  'prs.pti',
  'pwg-raster',
  'svg+xml',
  't38',
  'tiff',
  'tiff-fx',
  'vnd.adobe.photoshop',
  'vnd.airzip.accelerator.azv',
  'vnd.blockfact.facti',
  'vnd.clip',
  'vnd.cns.inf2',
  'vnd.dece.graphic',
  'vnd.djvu',
  'vnd.dvb.subtitle',
  'vnd.dwg',
  'vnd.dxf',
  'vnd.fastbidsheet',
  'vnd.fpx',
  'vnd.fst',
  'vnd.fujixerox.edmics-mmr',
  'vnd.fujixerox.edmics-rlc',
  'vnd.globalgraphics.pgb',
  'vnd.imgformats.ssimf',
  'vnd.microsoft.icon',
  'vnd.mix',
  'vnd.mozilla.apng',
  'vnd.ms-modi',
  'vnd.net-fpx',
  'vnd.pco.b16',
  'vnd.radiance',
  'vnd.sealed.png',
  'vnd.sealedmedia.softseal.gif',
  'vnd.sealedmedia.softseal.jpg',
  'vnd.sld',
  'vnd.svf',
  'vnd.tencent.tap',
  'vnd.valve.source.texture',
  'vnd.wap.wbmp',
  'vnd.xiff',
  'vnd.zbrush.pcx',
  'webp',
  'wmf',
  'x-emf',
  'x-wmf',
])

const HTTP_WHITESPACE: ReadonlySet<string> = new Set(['\t', '\n', '\r', ' '])

/**
 * Remove leading and trailing HTTP whitespace (tab, LF, CR and space).
 *
 * @link https://fetch.spec.whatwg.org/#http-whitespace
 */
export function trimHttpWhitespace(value: string): string {
  // Index scans keep the cost linear. A `[\t\n\r ]+$` regex backtracks in
  // quadratic time on a long run of inner whitespace.
  let start = 0
  let end = value.length

  while (start < end && HTTP_WHITESPACE.has(value[start])) {
    start++
  }

  while (end > start && HTTP_WHITESPACE.has(value[end - 1])) {
    end--
  }

  return value.slice(start, end)
}

/**
 * Get the essence of a MIME type value: the part before the first `;`, without
 * leading or trailing HTTP whitespace.
 *
 * @link https://mimesniff.spec.whatwg.org/#parse-a-mime-type
 */
export function toMimeEssence(mime: string): string {
  return trimHttpWhitespace(mime.split(';')[0])
}

/**
 * Get the image subtype from a MIME type value. Accepts a subtype (`png`), a
 * full MIME type (`image/png`, such as `File.type`) and the `jpg` file
 * extension, which becomes `jpeg`. MIME parameters and surrounding whitespace
 * are removed.
 */
export function toImageSubtype(mime: string): string {
  return toMimeEssence(mime)
    .replace(/^image\//i, '')
    .replace(/^jpg$/i, 'jpeg')
}

/**
 * Determines whether the given image subtype, such as `png` (not `image/png`),
 * is one of the IANA registered image formats or a non-standard `x-` format
 * (RFC 2425 `x-name`).
 *
 * @link    https://www.iana.org/assignments/media-types/media-types.xhtml#image
 * @link    https://tools.ietf.org/html/rfc2426#section-3.1.4
 */
export function isValidMimeType(mime: string): boolean {
  // toLowerCase() maps some non-ASCII letters, such as the Kelvin sign, to
  // ASCII ones
  const lowerCase = mime.replace(/[A-Z]+/g, (letters) => letters.toLowerCase())

  return MIME_TYPES.has(lowerCase) || /^x-[a-z0-9-]+$/i.test(mime)
}

/**
 * Map photo or logo options to a property input.
 *
 * @throws VCardException
 */
export function toMediaInput(
  element: 'logo' | 'photo',
  options: LogoOptions | PhotoOptions,
): PropertyInput {
  // An undefined form key, such as `url: undefined`, selects no form
  if (options.url !== undefined) {
    return { element, valueType: 'uri', value: options.url }
  }

  const label = `${PROPERTIES[element].label} MIME type`
  const mime = options.mime ?? DEFAULT_MIME_TYPE
  assertString({ value: mime, label })

  // Browsers return an empty File.type for unknown files. TYPE is optional, and
  // the JPEG default would mislabel them.
  if (toMimeEssence(mime) === '') {
    return { element, value: options.image }
  }

  const subtype = toImageSubtype(mime)

  if (!isValidMimeType(subtype)) {
    throw new VCardException(
      `${label} values must be an image type (got ${showValue(mime)})`,
    )
  }

  return {
    element,
    value: options.image,
    params: [{ kind: 'single', name: 'TYPE', value: subtype, upper: true }],
  }
}
