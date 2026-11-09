import VCardException from './VCardException.js'
import type { ParamSpec, ValueType } from './properties.js'
import {
  assertNoControlChars,
  assertString,
  describeType,
  showValue,
} from './validate.js'

export interface BuildKeyOptions {
  name: string
  valueType: ValueType
  defaultType: ValueType
  params?: ParamSpec[]
  rawParams?: unknown
  /** Names the property in parameter error messages */
  label: string
}

export interface QuoteParamValueOptions {
  value: string
  /** Names the parameter in error messages */
  label?: string
}

export interface EscapeTextOptions {
  value: string
  /** Names the property in error messages */
  label: string
}

const encoder = new TextEncoder()
const decoder = new TextDecoder()

// C0 control characters except tab, CR, LF, VT and FF, plus DEL. escapeText()
// turns the line-break characters into `\n`.
// oxlint-disable-next-line no-control-regex
const TEXT_CONTROL_CHARS = /[\x00-\x08\x0E-\x1F\x7F]/

// CRLF is one line break. VT, FF, NEL, U+2028 and U+2029 are line breaks for
// some parsers and spreadsheet exports.
// oxlint-disable-next-line no-control-regex
const TEXT_LINE_BREAKS = /\r\n|[\r\n\x0B\x0C\x85\u{2028}\u{2029}]/gu

// RFC 2426 section 4: `param *(";" param)`, where a param value is ptext or a
// quoted string. Control characters are checked before this pattern runs.
// https://tools.ietf.org/html/rfc2426#section-4
const PARAM_VALUE = '(?:[^";:,]*|"[^"]*")'
const PARAM = `[A-Za-z0-9-]+=${PARAM_VALUE}(?:,${PARAM_VALUE})*`
const RAW_PARAMS = new RegExp(`^${PARAM}(?:;${PARAM})*$`)

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
export function resolveType<T extends string>(
  type: T[],
  label = 'Type',
): string {
  // Plain JavaScript callers can pass a string or null
  if (!Array.isArray(type)) {
    throw new VCardException(
      `${label} values must be an array (got ${describeType(type)})`,
    )
  }

  // Plain JavaScript callers can pass any entry value, so check it before
  // toUpperCase()
  return type.length > 0
    ? `TYPE=${type.map((t) => quoteParamValue({ value: t, label }).toUpperCase()).join(',')}`
    : ''
}

/**
 * Escape special characters in text values per RFC 2426.
 *
 * Backslashes are replaced first to avoid double-escaping. Line breaks
 * (`\r\n`, `\n`, a lone `\r`, VT, FF, NEL, U+2028 and U+2029) become `\n`.
 * DEL and any other C0 control character except tab throw.
 *
 * @link   https://tools.ietf.org/html/rfc2426
 * @throws VCardException
 */
export function escapeText({ value, label }: EscapeTextOptions): string {
  assertString({ value, label })

  if (TEXT_CONTROL_CHARS.test(value)) {
    throw new VCardException(
      `${label} values must not contain control characters (got ${showValue(value)})`,
    )
  }

  return value
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(TEXT_LINE_BREAKS, '\\n')
}

/**
 * Prepare a property parameter value. A value with `;`, `:` or `,` is put in
 * double quotes. A double quote or a control character (such as a line break)
 * cannot appear in any parameter value, quoted or not.
 *
 * @link   https://tools.ietf.org/html/rfc2426#section-4
 * @throws VCardException
 */
export function quoteParamValue({
  value,
  label = 'Parameter',
}: QuoteParamValueOptions): string {
  assertString({ value, label })

  if (value.includes('"')) {
    throw new VCardException(
      `${label} values must not contain a double quote (got ${showValue(value)})`,
    )
  }

  // Horizontal tab is allowed as WSP
  assertNoControlChars({ value, label, allowTab: true })

  return /[;:,]/.test(value) ? `"${value}"` : value
}

/**
 * Fold a line according to RFC 2425 section 5.8.1.
 *
 * Lines MUST be no longer than 75 octets, excluding the line break. Multi-byte
 * UTF-8 sequences are never split across a fold boundary.
 *
 * @link   https://tools.ietf.org/html/rfc2425#section-5.8.1
 */
export function fold(text: string): string {
  // Strip the trailing CRLF before measuring. RFC 2425 does not count the line
  // break toward the 75-octet limit.
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
 * Format a `Date` as an RFC 2425 date-time in UTC, such as
 * `2024-01-15T10:30:00Z`. The grammar writes a fraction of a second with a
 * comma, so the milliseconds of `toISOString()` are cut. Cutting never moves
 * the second forward. The built-in `toISOString()` runs, so an override
 * cannot write other text.
 *
 * @link   https://tools.ietf.org/html/rfc2425#section-5.8.4
 */
export function formatDateTime(date: Date): string {
  return Date.prototype.toISOString.call(date).replace(/\.\d{3}Z$/, 'Z')
}

/**
 * Build a property key, such as `TEL;TYPE=WORK,VOICE`, from a name and
 * structured parameters. Structured parameter values are quoted here. Raw
 * parameters are checked against the RFC 2426 grammar and written as they are.
 *
 * `VALUE=<type>` is written when the RFC value type is not the default one,
 * and `ENCODING=b` for binary values.
 *
 * @throws VCardException
 */
export function buildKey({
  name,
  valueType,
  defaultType,
  params = [],
  rawParams,
  label,
}: BuildKeyOptions): string {
  const parts = [name]
  // The structured and list pipelines write RFC `text` values
  const toRfcType = (type: ValueType) =>
    type.startsWith('text') ? 'text' : type
  const rfcType = toRfcType(valueType)

  if (rfcType !== toRfcType(defaultType)) {
    parts.push(`VALUE=${rfcType}`)
  }

  if (valueType === 'binary') {
    parts.push('ENCODING=b')
  }

  for (const param of params) {
    if (param.kind === 'list') {
      const resolved = resolveType(param.value as string[], `${label} TYPE`)
      if (resolved !== '') {
        parts.push(resolved)
      }
    } else {
      const value = quoteParamValue({
        value: param.value as string,
        label: `${label} ${param.name.toUpperCase()}`,
      })
      parts.push(`${param.name}=${param.upper ? value.toUpperCase() : value}`)
    }
  }

  if (rawParams !== undefined) {
    const raw = rawParams as string
    const rawLabel = `${label} parameter`
    assertNoControlChars({ value: raw, label: rawLabel, allowTab: true })
    if (raw !== '') {
      if (!RAW_PARAMS.test(raw)) {
        throw new VCardException(
          `${rawLabel} values must be name=value pairs separated by ";" (got ${showValue(raw)}). Put a value with ";", ":" or "," in double quotes. A value cannot contain a double quote`,
        )
      }
      parts.push(raw)
    }
  }

  return parts.join(';')
}
