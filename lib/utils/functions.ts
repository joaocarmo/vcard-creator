import VCardException from '../VCardException.js'
import { MIME_TYPES } from './constants.js'
import type {
  ControlCharsOptions,
  PropertyNameOptions,
} from '../types/VCard.js'

const encoder = new TextEncoder()
const decoder = new TextDecoder()

/**
 * Convert a type array to the vCard TYPE= wire format.
 * ['work', 'postal'] → 'TYPE=WORK,POSTAL'
 * []                 → ''
 * ['work', 'a,b']     → 'TYPE=WORK,"A,B"'
 *
 * An entry with `;`, `:` or `,` is quoted.
 *
 * @throws VCardException
 */
export function resolveType<T extends string>(type: T[]): string {
  // Plain JavaScript callers can pass any entry value, so check it before
  // toUpperCase()
  return type.length > 0
    ? `TYPE=${type.map((t) => quoteParamValue(t).toUpperCase()).join(',')}`
    : ''
}

/**
 * Escape special characters in text values per RFC 2426.
 *
 * Backslashes are replaced first to avoid double-escaping. Line breaks
 * (`\r\n`, `\n` and a lone `\r`) become `\n`. Other C0 control characters,
 * except tab, cannot appear in text values.
 *
 * @link   http://tools.ietf.org/html/rfc2426
 * @throws VCardException
 */
export function escapeText(text: string): string {
  // oxlint-disable-next-line no-control-regex
  if (/[\x00-\x08\x0B\x0C\x0E-\x1F]/.test(text)) {
    throw new VCardException(
      `Text values cannot contain control characters (${JSON.stringify(text)})`,
    )
  }

  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r\n|\r|\n/g, '\\n')
}

/**
 * Prepare a property parameter value. A value with `;`, `:` or `,` is put in
 * double quotes. A double quote or a control character (such as a line break)
 * cannot appear in any parameter value, quoted or not.
 *
 * @link   https://tools.ietf.org/html/rfc2426#section-4
 * @throws VCardException
 */
export function quoteParamValue(value: string): string {
  // Plain JavaScript callers can pass undefined or other non-string values
  if (typeof value !== 'string') {
    throw new VCardException(
      `Parameter values must be strings (got ${typeof value})`,
    )
  }

  if (value.includes('"')) {
    throw new VCardException(
      `Parameter values cannot contain a double quote (${value})`,
    )
  }

  // Horizontal tab is allowed as WSP
  assertNoControlChars({ value, label: 'Parameter', allowTab: true })

  return /[;:,]/.test(value) ? `"${value}"` : value
}

/**
 * Check that a value written as it is has no control characters, such as a
 * line break. Rejects C0 (`\x00`-`\x1F`), DEL (`\x7F`), C1 (`\x80`-`\x9F`),
 * U+2028 and U+2029, which some parsers treat as line breaks. Tab is rejected
 * unless `allowTab` is set.
 *
 * @throws VCardException
 */
export function assertNoControlChars({
  value,
  label,
  allowTab = false,
}: ControlCharsOptions): void {
  const pattern = allowTab
    ? // oxlint-disable-next-line no-control-regex
      /[\x00-\x08\x0A-\x1F\x7F-\x9F\u{2028}\u{2029}]/u
    : // oxlint-disable-next-line no-control-regex
      /[\x00-\x1F\x7F-\x9F\u{2028}\u{2029}]/u

  if (pattern.test(value)) {
    throw new VCardException(
      `${label} values cannot contain control characters (${JSON.stringify(value)})`,
    )
  }
}

/**
 * Check that a property name or group has only ASCII letters, digits and `-`.
 *
 * @link   https://tools.ietf.org/html/rfc2425#section-5.8.2
 * @throws VCardException
 */
export function assertName({ value, label }: PropertyNameOptions): void {
  // Plain JavaScript callers can pass non-string values
  if (typeof value !== 'string' || !/^[A-Za-z0-9-]+$/.test(value)) {
    // JSON.stringify() throws on a BigInt
    const shown =
      typeof value === 'string' ? JSON.stringify(value) : typeof value
    throw new VCardException(
      `${label} values can contain only letters, digits and "-" (${shown})`,
    )
  }
}

/**
 * Check that a URI value has no control characters, tab, C1, U+2028 and U+2029
 * included.
 *
 * @link   https://tools.ietf.org/html/rfc3986#section-2
 * @throws VCardException
 */
export function assertUri(value: string): void {
  assertNoControlChars({ value, label: 'URI' })
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
 * Format a finite number as a vCard float: digits with an optional decimal
 * part. JavaScript writes values below 1e-6 in exponent form (`1e-7`), which
 * the grammar does not allow.
 *
 * @link   https://tools.ietf.org/html/rfc2425#section-5.8.4
 */
export function formatFloat(value: number): string {
  const text = String(value)

  return text.includes('e') ? value.toFixed(20).replace(/\.?0+$/, '') : text
}

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
