import { MIME_TYPES } from './constants.js'
import type { VCardVersion } from '../types/VCard.js'

const encoder = new TextEncoder()
const decoder = new TextDecoder()

/**
 * Convert a type array to the vCard TYPE= wire format.
 *
 * In v4 mode (RFC 6350):
 * - `'pref'` is never emitted as `TYPE=PREF`; use the `PREF=` integer parameter instead.
 * - Obsolete v3 ADR types (`dom`, `intl`, `postal`, `parcel`) are silently stripped.
 * - Obsolete v3 TEL types (`msg`, `bbs`, `car`, `modem`, `isdn`) are silently stripped.
 *
 * @param type  The type values to convert.
 * @param version  The vCard version controlling which values are valid. Defaults to 3.
 * @example
 * resolveType(['work', 'postal'])         // 'TYPE=WORK,POSTAL'  (v3)
 * resolveType(['work', 'pref'], 4)        // 'TYPE=WORK'         (v4: pref stripped)
 * resolveType(['dom', 'home'], 4)         // 'TYPE=HOME'         (v4: dom stripped)
 * resolveType([])                         // ''
 */
export function resolveType<T extends string>(
  type: T[],
  version: VCardVersion = 3,
): string {
  let types = type as string[]

  if (version === 4) {
    const V3_OBSOLETE = new Set([
      'dom',
      'intl',
      'postal',
      'parcel', // obsolete ADR types
      'msg',
      'bbs',
      'car',
      'modem',
      'isdn', // obsolete TEL types
      'pref', // v4 uses PREF= integer param instead
    ])
    types = types.filter((t) => !V3_OBSOLETE.has(t.toLowerCase()))
  }

  return types.length > 0
    ? `TYPE=${types.map((t) => t.toUpperCase()).join(',')}`
    : ''
}

/**
 * Build a `PREF=` parameter string for vCard 4.0 (RFC 6350 §5.3).
 *
 * Returns an empty string if `pref` is `undefined`, non-finite, or outside
 * the valid range of 1–100.
 *
 * @param pref  Preference value (1 = highest, 100 = lowest).
 * @example
 * buildPrefParam(1)         // 'PREF=1'
 * buildPrefParam(50)        // 'PREF=50'
 * buildPrefParam(undefined) // ''
 * buildPrefParam(NaN)       // ''
 * buildPrefParam(0)         // ''
 * buildPrefParam(101)       // ''
 */
export function buildPrefParam(pref: number | undefined): string {
  if (pref === undefined || !Number.isFinite(pref) || pref < 1 || pref > 100)
    return ''
  return `PREF=${Math.round(pref)}`
}

/**
 * Build a named parameter string (e.g., `ALTID=`, `PID=`, `MEDIATYPE=`).
 *
 * Returns an empty string if `value` is `undefined` or empty.
 *
 * @param name   Parameter name (e.g., `'ALTID'`).
 * @param value  Parameter value; returns `''` if falsy.
 * @example
 * buildParam('ALTID', '1')        // 'ALTID=1'
 * buildParam('MEDIATYPE', '')     // ''
 * buildParam('PID', undefined)    // ''
 */
export function buildParam(name: string, value: string | undefined): string {
  if (!value) return ''
  return `${name}=${value}`
}

/**
 * Escape special characters in text values per RFC 2426.
 *
 * Backslashes are replaced first to avoid double-escaping.
 *
 * @link   http://tools.ietf.org/html/rfc2426
 */
export function escapeText(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r\n/g, '\\n')
    .replace(/\n/g, '\\n')
}

/**
 * Fold a line according to RFC2425 section 5.8.1.
 *
 * Lines MUST be no longer than 75 octets, excluding the line break. Multi-byte
 * UTF-8 sequences are never split across a fold boundary.
 *
 * @link   http://tools.ietf.org/html/rfc2425#section-5.8.1
 */
export function fold(text: string): string {
  // Strip trailing CRLF before measuring — the line break is not counted
  // toward the 75-octet limit per RFC 2425
  const hasCrlf = text.endsWith('\r\n')
  const content = hasCrlf ? text.slice(0, -2) : text

  const bytes = encoder.encode(content)

  if (bytes.length <= 75) {
    return text
  }

  const lines: string[] = []
  let offset = 0
  let isFirstLine = true

  while (offset < bytes.length) {
    // First line gets 75 octets; continuation lines get 74 (leading space counts)
    const maxOctets = isFirstLine ? 75 : 74

    if (bytes.length - offset <= maxOctets) {
      lines.push(decoder.decode(bytes.subarray(offset)))
      break
    }

    // Find the last complete character boundary within maxOctets
    let end = offset + maxOctets

    // Walk back to a UTF-8 character boundary: continuation bytes start with 10xxxxxx
    while (end > offset && (bytes[end] & 0xc0) === 0x80) {
      end--
    }

    // Safety: if a single character exceeds the line limit, include it to avoid infinite loop
    // (can't happen with UTF-8 max 4 bytes vs 74 byte limit, but guard defensively)
    if (end === offset) {
      end = offset + maxOctets
    }

    lines.push(decoder.decode(bytes.subarray(offset, end)))
    offset = end
    isFirstLine = false
  }

  return lines.join('\r\n ') + '\r\n'
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
