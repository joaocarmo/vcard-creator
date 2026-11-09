import VCardException from './VCardException.js'

export interface CoordinateOptions {
  name: string
  value: number
  limit: number
}

export interface ControlCharsOptions {
  value: string
  label: string
  allowTab?: boolean
}

export interface PropertyNameOptions {
  value: string
  label: string
}

export interface DateCheckOptions {
  date: unknown
  label: string
}

export interface StringCheckOptions {
  value: unknown
  label: string
}

export type OptionsCheckOptions = StringCheckOptions

// oxlint-disable-next-line no-control-regex
const RAW_CONTROL_CHARS = /[\x00-\x1F\x7F-\x9F\u{2028}\u{2029}]/u

const RAW_CONTROL_CHARS_EXCEPT_TAB =
  // oxlint-disable-next-line no-control-regex
  /[\x00-\x08\x0A-\x1F\x7F-\x9F\u{2028}\u{2029}]/u

// JSON.stringify() writes these characters as they are
// oxlint-disable-next-line no-control-regex
const CONTROL_CHARS_KEPT_BY_JSON = /[\x7F-\x9F\u{2028}\u{2029}]/gu

// RFC 2425 §5.8.4: the dashes and colons are optional, and a fraction of a
// second uses a comma
const RFC_DATE_TIME =
  /^(\d{4})-?(\d{2})-?(\d{2})(?:T(\d{2}):?(\d{2}):?(\d{2})(?:,\d+)?(?:Z|[+-](\d{2}):?(\d{2}))?)?$/

// `+HH:MM` or `-HH:MM`. Ranges are checked separately.
export const UTC_OFFSET = /^[+-](\d{2}):(\d{2})$/

// A flat pattern: a repeated 4-character group overflows the regex stack on
// values of a few MB.
const BASE64_CHARS = /^[A-Za-z0-9+/]*={0,2}$/

/**
 * Check a value against RFC 2045 §6.8 base64: the base64 alphabet, padded
 * with `=` to a multiple of 4 characters.
 */
export function isBase64(value: string): boolean {
  return value.length % 4 === 0 && BASE64_CHARS.test(value)
}

/**
 * Check that a value is a date or a date-time in the RFC 2425 format, such as
 * `1990-05-15`, `19900515` or `1953-10-15T23:10:00Z`, and that the date exists.
 *
 * @link   https://tools.ietf.org/html/rfc2425#section-5.8.4
 */
export function isRfcDateOrDateTime(value: string): boolean {
  const match = RFC_DATE_TIME.exec(value)
  if (!match) {
    return false
  }

  const [year, month, day, hour, minute, second, zoneHour, zoneMinute] = match
    .slice(1)
    .map((part) => (part === undefined ? 0 : Number(part)))
  // Date.UTC() reads years 0 to 99 as 1900 to 1999, so count leap years here
  const isLeapYear = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0
  const daysInMonth = [
    31,
    isLeapYear ? 29 : 28,
    31,
    30,
    31,
    30,
    31,
    31,
    30,
    31,
    30,
    31,
  ][month - 1]

  return (
    month >= 1 &&
    month <= 12 &&
    day >= 1 &&
    day <= daysInMonth &&
    hour <= 23 &&
    minute <= 59 &&
    // 60 is a leap second
    second <= 60 &&
    zoneHour <= 23 &&
    zoneMinute <= 59
  )
}

// Longer values are cut, so a large image or a note does not fill the logs
const MAX_SHOWN_LENGTH = 64

/**
 * Quote a value for an error message, with every control character written
 * as a `\uXXXX` escape. A value longer than 64 characters is cut to its first
 * 64 characters, followed by its length.
 */
export function showValue(value: string): string {
  const isLong = value.length > MAX_SHOWN_LENGTH
  // Cut before quoting, so a value of several MB is not copied
  const shown = JSON.stringify(
    isLong ? value.slice(0, MAX_SHOWN_LENGTH) : value,
  ).replace(
    CONTROL_CHARS_KEPT_BY_JSON,
    (char) => `\\u${char.charCodeAt(0).toString(16).padStart(4, '0')}`,
  )

  return isLong ? `${shown}... (length ${value.length})` : shown
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
  // RegExp.test() turns undefined into "undefined", which would pass
  assertString({ value, label })

  const pattern = allowTab ? RAW_CONTROL_CHARS_EXCEPT_TAB : RAW_CONTROL_CHARS

  if (pattern.test(value)) {
    throw new VCardException(
      `${label} values cannot contain control characters (${showValue(value)})`,
    )
  }
}

/**
 * Check that a value is a string. Plain JavaScript callers can pass any value.
 *
 * @throws VCardException
 */
export function assertString({ value, label }: StringCheckOptions): void {
  if (typeof value !== 'string') {
    throw new VCardException(
      `${label} values must be strings (got ${describeType(value)})`,
    )
  }
}

/**
 * Check that an options argument is an object. Plain JavaScript callers can
 * leave it out or pass any value, which would throw a `TypeError` when the
 * method reads its fields.
 *
 * @throws VCardException
 */
export function assertOptions({ value, label }: OptionsCheckOptions): void {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new VCardException(
      `${label} options must be an object (got ${describeType(value)})`,
    )
  }
}

/**
 * Name the type of a value for an error message. `typeof` names `null` and
 * arrays `object`, so they are named on their own.
 */
export function describeType(value: unknown): string {
  if (value === null) {
    return 'null'
  }

  return Array.isArray(value) ? 'array' : typeof value
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
      typeof value === 'string' ? showValue(value) : describeType(value)
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
 * Check that a coordinate is a finite number from -limit to limit.
 *
 * @throws VCardException
 */
export function assertCoordinate({
  name,
  value,
  limit,
}: CoordinateOptions): void {
  if (!Number.isFinite(value)) {
    // Plain JavaScript callers can pass any value. String() throws on objects
    // without a usable toString().
    const shown =
      typeof value === 'number'
        ? String(value)
        : typeof value === 'string'
          ? showValue(value)
          : describeType(value)
    throw new VCardException(
      `Invalid ${name}: ${shown}. Must be a finite number.`,
    )
  }

  if (value < -limit || value > limit) {
    throw new VCardException(
      `Invalid ${name}: ${value}. Must be between -${limit} and ${limit}.`,
    )
  }
}

/**
 * Check that a value is a `Date`, including one from another realm, such as
 * `vm` or an iframe. `instanceof` fails across realms, and
 * `Symbol.toStringTag` can spoof `Object.prototype.toString`.
 */
export function isDate(value: unknown): value is Date {
  try {
    Date.prototype.getTime.call(value)
    return true
  } catch {
    return false
  }
}

/**
 * Check that a date is a valid `Date` object.
 *
 * @throws VCardException
 */
export function assertValidDate({ date, label }: DateCheckOptions): void {
  // Plain JavaScript callers can pass a string or other values
  if (!isDate(date)) {
    throw new VCardException(
      `Invalid ${label}: must be a Date (got ${describeType(date)})`,
    )
  }

  if (Number.isNaN(date.getTime())) {
    throw new VCardException(`Invalid ${label}: the Date is invalid`)
  }

  // toISOString() writes other years with a sign and 6 digits
  const year = date.getUTCFullYear()
  if (year < 0 || year > 9999) {
    throw new VCardException(
      `Invalid ${label}: the year must be 0000 to 9999 (got ${year})`,
    )
  }
}
