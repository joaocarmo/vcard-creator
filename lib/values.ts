import VCardException from './VCardException.js'
import { escapeText, formatFloat } from './format.js'
import type { ValueType } from './properties.js'
import type { GeoOptions } from './types/VCard.js'
import {
  assertCoordinate,
  assertNoControlChars,
  assertString,
  assertUri,
  assertValidDate,
  describeType,
  isBase64,
  isRfcDateOrDateTime,
  showValue,
  UTC_OFFSET,
} from './validate.js'

type ValuePipeline = (value: unknown, label: string) => string

/**
 * Check a property value by its value type and return the string to store.
 * Plain JavaScript callers can pass any value, so each pipeline checks it.
 */
export const VALUE_PIPELINES: Readonly<Record<ValueType, ValuePipeline>> = {
  text: (value, label) => escapeText({ value: value as string, label }),
  'text-structured': (value, label) =>
    (value as string[])
      .map((part) => escapeText({ value: part, label }))
      .join(';'),
  'text-list': (value, label) => {
    // Plain JavaScript callers can pass a string
    if (!Array.isArray(value)) {
      throw new VCardException(
        `${label} must be an array (got ${describeType(value)})`,
      )
    }

    // RFC 2426 text values can start and end with spaces
    return value.map((entry) => escapeText({ value: entry, label })).join(',')
  },
  uri: (value) => {
    assertUri(value as string)
    return value as string
  },
  raw: (value, label) => {
    assertNoControlChars({ value: value as string, label })
    return value as string
  },
  'raw-tab': (value, label) => {
    assertNoControlChars({ value: value as string, label, allowTab: true })
    return value as string
  },
  binary: (value, label) => {
    assertString({ value, label })

    // Wrapped base64, such as GNU `base64` output, is valid. `\s` would also
    // remove VT, FF, U+2028 and U+2029, which some parsers read as line breaks.
    const base64 = (value as string).replace(/[ \t\r\n]/g, '')

    if (!isBase64(base64)) {
      throw new VCardException(
        `${label} values must be base64 (got ${showValue(value as string)})`,
      )
    }

    return base64
  },
  'date-or-date-time': (value, label) => {
    const name = label.toLowerCase()

    if (value instanceof Date) {
      assertValidDate({ date: value, label: name })
      return value.toISOString().slice(0, 10)
    }

    assertString({ value, label })

    if (!isRfcDateOrDateTime(value as string)) {
      throw new VCardException(
        `Invalid ${name}: must be an RFC 2425 date or date-time, such as 1990-05-15 (got ${showValue(value as string)})`,
      )
    }

    return value as string
  },
  'date-time': (value, label) => {
    assertValidDate({ date: value, label: label.toLowerCase() })
    return (value as Date).toISOString()
  },
  'utc-offset': (value, label) => {
    const offset = UTC_OFFSET.exec(value as string)

    if (offset === null || Number(offset[1]) > 23 || Number(offset[2]) > 59) {
      throw new VCardException(
        `Invalid ${label.toLowerCase()} offset: ${showValue(value as string)}. Hours must be 00 to 23 and minutes 00 to 59.`,
      )
    }

    return value as string
  },
  'float-pair': (value) => {
    const { latitude, longitude } = value as GeoOptions
    assertCoordinate({ name: 'latitude', value: latitude, limit: 90 })
    assertCoordinate({ name: 'longitude', value: longitude, limit: 180 })
    return `${formatFloat(latitude)};${formatFloat(longitude)}`
  },
}
