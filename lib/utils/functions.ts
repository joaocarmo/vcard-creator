import { MIME_TYPES } from './constants.js'

const encoder = new TextEncoder()
const decoder = new TextDecoder()

/**
 * Convert a type array to the vCard TYPE= wire format.
 * ['work', 'postal'] → 'TYPE=WORK,POSTAL'
 * []                 → ''
 */
export function resolveType<T extends string>(type: T[]): string {
  return type.length > 0
    ? `TYPE=${type.map((t) => t.toUpperCase()).join(',')}`
    : ''
}

/**
 * Escape special characters in text values per RFC 2426.
 *
 * Backslashes are replaced first to avoid double-escaping.
 *
 * @link   http://tools.ietf.org/html/rfc2426
 * @param  {string} text
 * @return {string}
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
 * @param  {string} text
 * @return {string}
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
 * @param   {string} mime A string describing the MIME Media Type
 * @returns {boolean}
 */
export function isValidMimeType(mime: string): boolean {
  if (mime && MIME_TYPES.includes(mime.toLowerCase())) {
    return true
  }

  return false
}
