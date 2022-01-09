import mimeTypes from './mime-types.json'

/**
 * Encodes data with MIME base64
 *
 * @param  {string} data text
 * @return {string}
 */
export function b64encode(data: string) {
  try {
    // For the browser
    return btoa(data)
  } catch (e) {
    // For Node.js
    return Buffer.from(data).toString('base64')
  }
}

/**
 * Split a string into smaller chunks
 * e.g., to match RFC 2045 semantics
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

  const chunks = body.match(new RegExp(`.{0,${chunklength}}`, 'g')) as string[]

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
 * @link   http://tools.ietf.org/html/rfc2425#section-5.8.1
 * @param  {string} text
 * @return {string}
 */
export function fold(text: string): string {
  if (text.length <= 75) {
    return text
  }

  // split, wrap and trim trailing separator
  const chunks = text.match(/.{1,73}/g) as string[]
  const wrapped = chunks.join('\r\n ').trim()

  return `${wrapped}\r\n`
}

/**
 * Determines whether the given MIME Media Type is one of the IANA registered
 * image formats
 *
 * @link    https://www.iana.org/assignments/media-types/media-types.xhtml#image
 * @param   {string} mime A string describing the MIME Media Type
 * @returns {boolean}
 */
export function isValidMimeType(mime: string): boolean {
  if (mime && mimeTypes.includes(mime.toLowerCase())) {
    return true
  }

  return false
}
