import VCardException from './VCardException.js'
import type { PropertyInput } from './properties.js'
import type { LogoOptions, PhotoOptions } from './types/VCard.js'
import { assertString, showValue } from './validate.js'

export const DEFAULT_MIME_TYPE = 'JPEG'

/**
 * IANA registered image MIME types. Entries are lower case, because the lookup
 * lower-cases its input.
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
  'ief',
  'j2c',
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
  'prs.btif',
  'prs.pti',
  'pwg-raster',
  'svg+xml',
  't38',
  'tiff',
  'tiff-fx',
  'vnd.adobe.photoshop',
  'vnd.airzip.accelerator.azv',
  'vnd.cns.inf2',
  'vnd.dece.graphic',
  'vnd.djvu',
  'vnd.dwg',
  'vnd.dxf',
  'vnd.dvb.subtitle',
  'vnd.fastbidsheet',
  'vnd.fpx',
  'vnd.fst',
  'vnd.fujixerox.edmics-mmr',
  'vnd.fujixerox.edmics-rlc',
  'vnd.globalgraphics.pgb',
  'vnd.microsoft.icon',
  'vnd.mix',
  'vnd.ms-modi',
  'vnd.mozilla.apng',
  'vnd.net-fpx',
  'vnd.pco.b16',
  'vnd.radiance',
  'vnd.sealed.png',
  'vnd.sealedmedia.softseal.gif',
  'vnd.sealedmedia.softseal.jpg',
  'vnd.svf',
  'vnd.tencent.tap',
  'vnd.valve.source.texture',
  'vnd.wap.wbmp',
  'vnd.xiff',
  'vnd.zbrush.pcx',
  'webp',
  'wmf',
])

/**
 * Get the image subtype from a MIME type value. Accepts a subtype (`png`), a
 * full MIME type (`image/png`, such as `File.type`) and the `jpg` file
 * extension, which becomes `jpeg`.
 */
export function toImageSubtype(mime: string): string {
  return mime.replace(/^image\//i, '').replace(/^jpg$/i, 'jpeg')
}

/**
 * Determines whether the given MIME Media Type is one of the IANA registered
 * image formats.
 *
 * @link    https://www.iana.org/assignments/media-types/media-types.xhtml#image
 */
export function isValidMimeType(mime: string): boolean {
  return mime !== '' && MIME_TYPES.has(mime.toLowerCase())
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
  if ('url' in options) {
    return { element, valueType: 'uri', value: options.url }
  }

  // A data URL, such as canvas.toDataURL() output. RFC 2397 schemes ignore
  // case.
  if (typeof options.image === 'string' && /^data:/i.test(options.image)) {
    throw new VCardException(
      `Image values must be raw base64. Remove the "data:" prefix and pass the MIME type as mime (got ${showValue(options.image)})`,
    )
  }

  const mime = options.mime ?? DEFAULT_MIME_TYPE
  assertString({ value: mime, label: 'MIME Media Type' })

  const subtype = toImageSubtype(mime)

  if (!isValidMimeType(subtype)) {
    throw new VCardException(
      `The MIME Media Type is invalid (${showValue(mime)})`,
    )
  }

  return {
    element,
    value: options.image,
    params: [{ kind: 'single', name: 'TYPE', value: subtype, upper: true }],
  }
}
