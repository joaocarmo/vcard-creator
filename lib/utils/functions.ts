/**
 * Encodes data with MIME base64
 *
 * @param  data text
 * @return string
 */
export function b64encode(data: string): string {
  // for the browser
  const browserGlobal: Window = (globalThis as unknown) as Window
  if (typeof browserGlobal?.btoa === 'function') {
    return browserGlobal.btoa(data)
  }

  // for node.js
  const nodeGlobal: NodeJS.Global = (globalThis as unknown) as NodeJS.Global
  if (typeof nodeGlobal?.Buffer === 'function') {
    return nodeGlobal.Buffer.from(data).toString('base64')
  }

  return ''
}

/**
 * Split a string into smaller chunks
 * e.g., to match RFC 2045 semantics
 *
 * @link   https://tools.ietf.org/html/rfc2045
 * @param  body text
 * @return string
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
 * @param  string text
 * @return string
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
 * @param  string text
 * @return string
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
