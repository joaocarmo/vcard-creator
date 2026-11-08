import {
  assertName,
  assertNoControlChars,
  assertOptions,
  assertString,
  assertUri,
  escapeText,
  fold,
  formatFloat,
  isRfcDateOrDateTime,
  isValidMimeType,
  quoteParamValue,
  resolveType,
  toImageSubtype,
} from './functions'
import { MIME_TYPES } from './constants'
import VCardException from '../VCardException'

describe('quoteParamValue()', () => {
  it('should keep simple values as they are', () => {
    expect(quoteParamValue('X')).toEqual('X')
  })

  it('should quote values with a semicolon, colon or comma', () => {
    expect(quoteParamValue('My Site;x')).toEqual('"My Site;x"')
    expect(quoteParamValue('a:b')).toEqual('"a:b"')
    expect(quoteParamValue('a,b')).toEqual('"a,b"')
  })

  it('should throw on a non-string value', () => {
    expect(() => quoteParamValue(undefined as unknown as string)).toThrow(
      VCardException,
    )
    expect(() => quoteParamValue(42 as unknown as string)).toThrow(
      VCardException,
    )
    expect(() => quoteParamValue(null as unknown as string)).toThrow(
      'Parameter values must be strings (got null)',
    )
  })

  it('should throw on a double quote', () => {
    expect(() => quoteParamValue('a"b')).toThrow(VCardException)
  })

  it('should throw on a control character', () => {
    expect(() => quoteParamValue('a\r\nEMAIL:x')).toThrow(VCardException)
    expect(() => quoteParamValue('a\nb')).toThrow(VCardException)
    expect(() => quoteParamValue('a\x00b')).toThrow(VCardException)
    expect(() => quoteParamValue('a\x7Fb')).toThrow(VCardException)
    expect(() => quoteParamValue('a\x85b')).toThrow(VCardException)
    expect(() => quoteParamValue('a\u{2028}b')).toThrow(VCardException)
  })

  it('should allow a horizontal tab', () => {
    expect(quoteParamValue('a\tb')).toEqual('a\tb')
  })
})

describe('assertString()', () => {
  it('should accept a string', () => {
    expect(() => assertString({ value: '', label: 'UID' })).not.toThrow()
  })

  it.each([
    ['42', 42, 'number'],
    ['null', null, 'null'],
    ['undefined', undefined, 'undefined'],
    ['{}', {}, 'object'],
    ['42n', 42n, 'bigint'],
    ["Symbol('x')", Symbol('x'), 'symbol'],
  ])('should throw on %s', (_, value, shown) => {
    expect(() => assertString({ value, label: 'UID' })).toThrow(VCardException)
    expect(() => assertString({ value, label: 'UID' })).toThrow(
      `UID values must be strings (got ${shown})`,
    )
  })
})

describe('assertOptions()', () => {
  it.each([
    ['{}', {}],
    ['Object.create(null)', Object.create(null)],
  ])('should accept %s', (_, value) => {
    expect(() => assertOptions({ value, label: 'addX()' })).not.toThrow()
  })

  it.each([
    ['undefined', undefined, 'undefined'],
    ['null', null, 'null'],
    ["'x'", 'x', 'string'],
    ['42', 42, 'number'],
    ['[]', [], 'array'],
    ['a function', () => ({}), 'function'],
  ])('should throw on %s', (_, value, shown) => {
    expect(() => assertOptions({ value, label: 'addX()' })).toThrow(
      VCardException,
    )
    expect(() => assertOptions({ value, label: 'addX()' })).toThrow(
      `addX() options must be an object (got ${shown})`,
    )
  })
})

describe('assertNoControlChars()', () => {
  it.each([undefined, null, 42, {}])(
    'should throw on a non-string value (%s)',
    (value) => {
      expect(() =>
        assertNoControlChars({
          value: value as unknown as string,
          label: 'UID',
        }),
      ).toThrow('UID values must be strings')
    },
  )

  it('should accept printable text', () => {
    expect(() =>
      assertNoControlChars({ value: 'a;b,c d', label: 'UID' }),
    ).not.toThrow()
  })

  it.each([
    '\n',
    '\r',
    '\r\n',
    '\t',
    '\x00',
    '\x7F',
    '\x80',
    '\x85',
    '\x9F',
    '\u{2028}',
    '\u{2029}',
  ])('should throw on control character %j', (char) => {
    expect(() =>
      assertNoControlChars({ value: `a${char}b`, label: 'UID' }),
    ).toThrow(VCardException)
  })

  it('should name the label in the message', () => {
    expect(() =>
      assertNoControlChars({ value: 'a\nb', label: 'Email' }),
    ).toThrow('Email values cannot contain control characters ("a\\nb")')
  })

  it.each([
    ['\x7F', '\\u007f'],
    ['\x85', '\\u0085'],
    ['\u{2028}', '\\u2028'],
  ])('should escape %j in the message', (char, shown) => {
    expect(() =>
      assertNoControlChars({ value: `a${char}b`, label: 'UID' }),
    ).toThrow(`UID values cannot contain control characters ("a${shown}b")`)
  })

  it('should accept a tab with allowTab', () => {
    expect(() =>
      assertNoControlChars({
        value: 'a\tb',
        label: 'Property',
        allowTab: true,
      }),
    ).not.toThrow()
  })

  it.each(['\n', '\r', '\x85', '\u{2028}', '\u{2029}'])(
    'should still throw on %j with allowTab',
    (char) => {
      expect(() =>
        assertNoControlChars({
          value: `a${char}b`,
          label: 'Property',
          allowTab: true,
        }),
      ).toThrow(VCardException)
    },
  )
})

describe('assertUri()', () => {
  it('should accept a URI with a comma and a semicolon', () => {
    expect(() => assertUri('https://example.com/a;b?c=1,2')).not.toThrow()
  })

  it('should accept a URI with other non-ASCII characters', () => {
    expect(() => assertUri('https://müller.de')).not.toThrow()
  })

  it.each([
    '\n',
    '\r',
    '\r\n',
    '\t',
    '\x00',
    '\x7F',
    '\x80',
    '\x85',
    '\x9F',
    '\u{2028}',
    '\u{2029}',
  ])('should throw on control character %j', (char) => {
    expect(() => assertUri(`https://example.com/a${char}b`)).toThrow(
      VCardException,
    )
  })
})

describe('formatFloat()', () => {
  it('should keep the default form for ordinary values', () => {
    expect(formatFloat(51.0543)).toEqual('51.0543')
    expect(formatFloat(-122.082932)).toEqual('-122.082932')
    expect(formatFloat(0)).toEqual('0')
  })

  it('should expand exponent notation', () => {
    expect(formatFloat(1e-7)).toEqual('0.0000001')
    expect(formatFloat(-1.5e-7)).toEqual('-0.00000015')
  })
})

describe('escapeText()', () => {
  it.each([undefined, null, 42, {}])(
    'should throw on a non-string value (%s)',
    (value) => {
      expect(() => escapeText(value as unknown as string)).toThrow(
        'Text values must be strings',
      )
    },
  )

  it('should escape backslashes first', () => {
    expect(escapeText('C:\\Users')).toEqual('C:\\\\Users')
  })

  it('should escape semicolons', () => {
    expect(escapeText('a;b')).toEqual('a\\;b')
  })

  it('should escape commas', () => {
    expect(escapeText('a,b')).toEqual('a\\,b')
  })

  it('should escape CRLF newlines', () => {
    expect(escapeText('\r\n')).toEqual('\\n')
  })

  it('should escape LF newlines', () => {
    expect(escapeText('\n')).toEqual('\\n')
  })

  it('should escape a lone CR', () => {
    expect(escapeText('a\rb')).toEqual('a\\nb')
  })

  it('should escape each line break in a sequence', () => {
    expect(escapeText('\n\r')).toEqual('\\n\\n')
    expect(escapeText('\r\n\r\n')).toEqual('\\n\\n')
  })

  it('should handle combined special characters', () => {
    expect(escapeText('a;b,c\\d\ne')).toEqual('a\\;b\\,c\\\\d\\ne')
  })

  it('should escape backslash before semicolon to avoid double-escaping', () => {
    expect(escapeText('a\\;b')).toEqual('a\\\\\\;b')
  })

  it('should pass through strings with no special characters', () => {
    expect(escapeText('hello world')).toEqual('hello world')
  })

  it('should pass through empty string', () => {
    expect(escapeText('')).toEqual('')
  })

  it.each(['\x00', '\x08', '\x0E', '\x1C', '\x1E', '\x1F', '\x7F'])(
    'should throw on control character %j',
    (char) => {
      expect(() => escapeText(`a${char}b`)).toThrow(VCardException)
    },
  )

  it('should name the character in the message', () => {
    expect(() => escapeText('a\x01b')).toThrow(
      'Text values cannot contain control characters ("a\\u0001b")',
    )
    expect(() => escapeText('a\x7Fb')).toThrow(
      'Text values cannot contain control characters ("a\\u007fb")',
    )
  })

  it.each(['\x0B', '\x0C', '\x85', '\u{2028}', '\u{2029}'])(
    'should escape %j as a line break',
    (char) => {
      expect(escapeText(`a${char}b`)).toEqual('a\\nb')
    },
  )

  it('should count CRLF as one line break and VT as another', () => {
    expect(escapeText('a\r\n\x0Bb')).toEqual('a\\n\\nb')
  })

  it.each(['\t', '\x80', '\x9F', 'é', '漢', '😀'])(
    'should pass through %j',
    (char) => {
      expect(escapeText(`a${char}b`)).toEqual(`a${char}b`)
    },
  )
})

describe('fold()', () => {
  it('should return an empty string for an empty string', () => {
    expect(fold('')).toEqual('')
  })

  it('should not fold lines under 75 octets', () => {
    const short = 'TEL;TYPE=WORK:+1-555-0100\r\n'
    expect(fold(short)).toBe(short)
  })

  it('should fold a line according to RFC 2425 section 5.8.1', () => {
    const bigString =
      'lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua'
    const splitString =
      'lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tem\r\n por incididunt ut labore et dolore magna aliqua\r\n'
    expect(fold(bigString)).toEqual(splitString)
  })

  it('should fold ASCII lines over 75 octets', () => {
    const long = 'A'.repeat(80) + '\r\n'
    const result = fold(long)
    expect(result).toContain('\r\n ')
    const lines = result.split('\r\n ')
    const encoder = new TextEncoder()
    expect(encoder.encode(lines[0]).length).toBeLessThanOrEqual(75)
  })

  it('should handle exactly 75 octets without folding', () => {
    const exact = 'X'.repeat(75)
    expect(fold(exact)).toBe(exact)
  })

  it('should handle 76 octets by folding', () => {
    const oneOver = 'X'.repeat(76)
    const result = fold(oneOver)
    expect(result).toContain('\r\n ')
  })

  it('should fold CJK text at octet boundaries without splitting characters', () => {
    const exactly75 = '漢'.repeat(25)
    expect(fold(exactly75)).toBe(exactly75)

    const exactly75WithCrlf = '漢'.repeat(25) + '\r\n'
    expect(fold(exactly75WithCrlf)).toBe(exactly75WithCrlf)

    const over75 = '漢'.repeat(26)
    const result = fold(over75)
    expect(result).toContain('\r\n ')
    const charCount = (result.match(/漢/g) || []).length
    expect(charCount).toBe(26)
  })

  it('should fold emoji without splitting multi-byte sequences', () => {
    const under = '😀'.repeat(18) + '\r\n'
    expect(fold(under)).toBe(under)

    const over = '😀'.repeat(19) + '\r\n'
    const result = fold(over)
    expect(result).toContain('\r\n ')
    const emojiCount = (result.match(/😀/g) || []).length
    expect(emojiCount).toBe(19)
  })

  it('should fold mixed ASCII and multi-byte text correctly', () => {
    const mixed = 'A'.repeat(60) + '漢'.repeat(6)
    const result = fold(mixed)
    expect(result).toContain('\r\n ')
    const aCount = (result.match(/A/g) || []).length
    const cjkCount = (result.match(/漢/g) || []).length
    expect(aCount).toBe(60)
    expect(cjkCount).toBe(6)
  })
})

describe('isRfcDateOrDateTime()', () => {
  it.each([
    '1990-05-15',
    '19900515',
    '1990-0515',
    '1953-10-15T23:10:00Z',
    '19531015T231000Z',
    '1953-10-15T23:10:00,123+01:00',
    '1953-10-15T23:10:00-0500',
    '2000-02-29',
    '0000-02-29',
  ])('should accept %j', (value) => {
    expect(isRfcDateOrDateTime(value)).toBe(true)
  })

  it.each([
    '1990-5-15',
    '90-05-15',
    '1990-05-15T23:10',
    '1990-05-15T23:10:00.5Z',
    '1990-05-15T23:10:00+01',
    '1900-02-29',
    '1990-04-31',
    '1990-13-01',
    '1990-05-15T24:00:00Z',
    '1990-05-15\n',
  ])('should reject %j', (value) => {
    expect(isRfcDateOrDateTime(value)).toBe(false)
  })

  // Temporal checks the calendar only. The RFC 2425 grammar is covered by the
  // cases above.
  it('should agree with Temporal on which dates exist', () => {
    if (typeof Temporal === 'undefined') {
      throw new Error(
        'Temporal is missing. Run the tests with the Node.js version in .nvmrc.',
      )
    }

    const pad = (value: number, length: number) =>
      String(value).padStart(length, '0')
    // A full 400-year leap cycle, plus the century years and the last year
    const years = [
      ...Array.from({ length: 401 }, (_, year) => year),
      1900,
      2000,
      2100,
      9999,
    ]
    const dateExists = (value: string) => {
      try {
        Temporal.PlainDate.from(value, { overflow: 'reject' })
        return true
      } catch (error) {
        if (error instanceof RangeError) {
          return false
        }
        throw error
      }
    }

    const mismatches: string[] = []
    for (const year of years) {
      for (let month = 0; month <= 13; month++) {
        for (let day = 0; day <= 32; day++) {
          const value = `${pad(year, 4)}-${pad(month, 2)}-${pad(day, 2)}`
          if (isRfcDateOrDateTime(value) !== dateExists(value)) {
            mismatches.push(value)
          }
        }
      }
    }

    expect(mismatches).toEqual([])
  })
})

describe('isValidMimeType()', () => {
  it('should return true for a valid MIME type', () => {
    expect(isValidMimeType('jpeg')).toBe(true)
  })

  it('should store every MIME_TYPES entry in lower case', () => {
    const notLowerCase = [...MIME_TYPES].filter(
      (mime) => mime !== mime.toLowerCase(),
    )
    expect(notLowerCase).toEqual([])
  })

  it('should return false for an invalid MIME type', () => {
    expect(isValidMimeType('foobar')).toBe(false)
  })
})

describe('toImageSubtype()', () => {
  it('should keep a subtype as it is', () => {
    expect(toImageSubtype('png')).toBe('png')
  })

  it('should remove the image/ prefix in any case', () => {
    expect(toImageSubtype('image/png')).toBe('png')
    expect(toImageSubtype('IMAGE/svg+xml')).toBe('svg+xml')
  })

  it('should change jpg to jpeg', () => {
    expect(toImageSubtype('jpg')).toBe('jpeg')
    expect(toImageSubtype('image/JPG')).toBe('jpeg')
  })
})

describe('resolveType()', () => {
  it('should produce TYPE= format from array', () => {
    expect(resolveType(['work', 'postal'])).toBe('TYPE=WORK,POSTAL')
  })

  it('should produce single TYPE= from single-element array', () => {
    expect(resolveType(['cell'])).toBe('TYPE=CELL')
  })

  it('should return empty string from empty array', () => {
    expect(resolveType([])).toBe('')
  })

  it('should throw on an entry with a control character', () => {
    expect(() => resolveType(['work', 'home\nX-INJECTED:1'])).toThrow(
      VCardException,
    )
  })

  it('should quote each entry with a semicolon, colon or comma', () => {
    expect(resolveType(['work', 'a,b'])).toBe('TYPE=WORK,"A,B"')
    expect(resolveType(['a;b', 'c:d'])).toBe('TYPE="A;B","C:D"')
  })

  it('should throw on an entry with a double quote', () => {
    expect(() => resolveType(['work', 'a"b'])).toThrow(VCardException)
  })

  it.each([
    ['work', 'string'],
    [null, 'null'],
  ])('should throw on a non-array type (%j)', (type, shown) => {
    expect(() => resolveType(type as unknown as string[])).toThrow(
      `Type values must be an array (got ${shown})`,
    )
  })

  it.each([undefined, 1])('should throw VCardException on entry %j', (t) => {
    expect(() => resolveType([t as unknown as string])).toThrow(VCardException)
  })

  it('should allow a tab in an entry', () => {
    expect(resolveType(['a\tb'])).toBe('TYPE=A\tB')
  })
})

describe('assertName()', () => {
  it.each(['X-A', 'item1', 'TEL', 'x-custom-field'])(
    'should accept %j',
    (v) => {
      expect(() => assertName({ value: v, label: 'Group' })).not.toThrow()
    },
  )

  it.each(['', 'X:A', 'X;A', 'X.A', 'X A', 'X_A', 'É', 'X\tA', 'X\nA'])(
    'should throw on %j',
    (v) => {
      expect(() => assertName({ value: v, label: 'Group' })).toThrow(
        VCardException,
      )
    },
  )

  it('should name null in the message', () => {
    expect(() =>
      assertName({ value: null as unknown as string, label: 'Group' }),
    ).toThrow('Group values can contain only letters, digits and "-" (null)')
  })

  it('should throw VCardException on a BigInt', () => {
    expect(() =>
      assertName({ value: BigInt(1) as unknown as string, label: 'Group' }),
    ).toThrow('Group values can contain only letters, digits and "-" (bigint)')
  })

  it.each([undefined, null, 1])('should throw on non-string %j', (v) => {
    expect(() =>
      assertName({ value: v as unknown as string, label: 'Group' }),
    ).toThrow(VCardException)
  })

  it('should name the label in the message', () => {
    expect(() => assertName({ value: 'X:A', label: 'Property name' })).toThrow(
      'Property name values can contain only letters, digits and "-" ("X:A")',
    )
  })
})
