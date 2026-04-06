import { MIME_TYPES } from './constants.js'

const encoder = new TextEncoder()
const decoder = new TextDecoder()

/**
 * Check if the argument is an options object (as opposed to a positional
 * string/number).
 * When used as `isOptions<SomeOptions>(arg)`, TypeScript narrows to
 * `SomeOptions` on true and excludes it on false.
 */
export function isOptions<T extends object>(
  arg: T | string | number,
): arg is T {
  return typeof arg === 'object' && arg !== null && !Array.isArray(arg)
}

/**
 * Convert a type array or legacy string to the vCard TYPE= wire format.
 * ['work', 'postal'] → 'TYPE=WORK,POSTAL'
 * 'WORK;POSTAL'      → 'TYPE=WORK,POSTAL' (legacy string, best-effort)
 * ''                 → ''
 */
export function resolveType<T extends string>(type: T[] | string): string {
  if (Array.isArray(type)) {
    return type.length > 0
      ? `TYPE=${type.map((t) => t.toUpperCase()).join(',')}`
      : ''
  }

  if (type === '') {
    return ''
  }

  return `TYPE=${type.replace(/;/g, ',').toUpperCase()}`
}

/**
 * Encodes data with MIME base64.
 *
 * @param  {string} data text
 * @return {string}
 */
export function b64encode(data: string): string {
  try {
    // For the browser
    return btoa(data)
  } catch {
    // For Node.js
    return Buffer.from(data).toString('base64')
  }
}

/**
 * Split a string into smaller chunks e.g., to match RFC 2045 semantics.
 *
 * Note: This function counts characters, not octets. This is safe because it is
 * only used for base64-encoded data, which is strictly ASCII (A-Z, a-z, 0-9,
 * +, /, =) — every character is exactly 1 octet.
 *
 * @link   https://tools.ietf.org/html/rfc2045
 * @param  {string} body text
 * @return {string}
 */
export function chunkSplit(body: string, chunklen = 76, end = '\r\n'): string {
  const chunklength = chunklen || 76
  const ending = end || '\r\n'

  if (chunklen < 1) {
    return ''
  }

  const chunks = body.match(new RegExp(`.{0,${chunklength}}`, 'g'))

  if (!chunks) {
    return ''
  }

  return chunks.join(ending)
}

/**
 * Escape newline characters according to RFC2425 section 5.8.4.
 *
 * @link   http://tools.ietf.org/html/rfc2425#section-5.8.4
 * @param  {string} text
 * @return {string}
 */
export function escape(text: string): string {
  let escapedText = `${text}`.replace(/\r\n/g, '\\n')
  escapedText = escapedText.replace(/\n/g, '\\n')

  return escapedText
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
