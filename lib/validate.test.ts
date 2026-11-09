import {
  assertCoordinate,
  assertName,
  assertNoControlChars,
  assertOptions,
  assertString,
  assertUri,
  assertValidDate,
  describeType,
  isRfcDateOrDateTime,
  showValue,
} from './validate'
import VCardException from './VCardException'

describe('showValue()', () => {
  it('should quote a value of 64 characters in full', () => {
    const value = 'a'.repeat(64)
    expect(showValue(value)).toBe(`"${value}"`)
  })

  it('should cut a value of 65 characters and add its length', () => {
    expect(showValue('a'.repeat(65))).toBe(`"${'a'.repeat(64)}"... (length 65)`)
  })

  it('should show the first 64 characters of a value of 10,000', () => {
    expect(showValue('b'.repeat(10_000))).toBe(
      `"${'b'.repeat(64)}"... (length 10000)`,
    )
  })

  it('should escape control characters in the shown part', () => {
    expect(showValue(`\x85${'a'.repeat(70)}`)).toBe(
      `"\\u0085${'a'.repeat(63)}"... (length 71)`,
    )
  })
})

describe('describeType()', () => {
  it.each([
    ['[]', [], 'array'],
    ['null', null, 'null'],
    ['{}', {}, 'object'],
    ['42', 42, 'number'],
  ])('should name %s as %s', (_, value, name) => {
    expect(describeType(value)).toBe(name)
  })
})

describe('assertCoordinate()', () => {
  it.each([
    ['NaN', NaN, 'NaN'],
    ['a string', 'x'.repeat(100), `"${'x'.repeat(64)}"... (length 100)`],
    ['an array', [], 'array'],
    ['null', null, 'null'],
    ['undefined', undefined, 'undefined'],
  ])('should show %s in the message', (_, value, shown) => {
    expect(() =>
      assertCoordinate({
        name: 'latitude',
        value: value as unknown as number,
        limit: 90,
      }),
    ).toThrow(`Invalid latitude: ${shown}. Must be a finite number.`)
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

  // assertNoControlChars() owns the full character list
  it.each(['\n', '\t', '\x85', '\u{2028}'])(
    'should throw on control character %j',
    (char) => {
      expect(() => assertUri(`https://example.com/a${char}b`)).toThrow(
        VCardException,
      )
    },
  )
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
    '1953-10-15T23:10:00',
    '2024-02-29',
    '2000-02-29',
    '0000-02-29',
    '1990-12-31T23:59:60Z',
  ])('should accept %j', (value) => {
    expect(isRfcDateOrDateTime(value)).toBe(true)
  })

  it.each([
    'not-a-date',
    '',
    ' 1990-05-15',
    '1990-5-15',
    '90-05-15',
    '1990-05-15T23:10',
    '1990-05-15T00:00Z',
    '1990-05-15T23:10:00.5Z',
    '1990-05-15T23:10:00+01',
    '1990-05-15T23:10:00+24:00',
    '1900-02-29',
    '2023-02-29',
    '1990-04-31',
    '19900230',
    '1990-02-30T00:00:00Z',
    '1990-13-01',
    '1990-00-10',
    '1990-05-00',
    '1990-05-15T24:00:00Z',
    '1990-05-15T23:60:00Z',
    '1990-05-15T23:10:61Z',
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

describe('assertValidDate()', () => {
  it.each(['0000-01-01T00:00:00Z', '9999-12-31T23:59:59Z'])(
    'should accept a Date at the year limit (%s)',
    (iso) => {
      expect(() =>
        assertValidDate({ date: new Date(iso), label: 'birthday' }),
      ).not.toThrow()
    },
  )

  it.each([
    ['+010000-01-01T00:00:00Z', 10000],
    ['-000001-01-01T00:00:00Z', -1],
  ])('should throw on a Date in year %s', (iso, year) => {
    expect(() =>
      assertValidDate({ date: new Date(iso), label: 'birthday' }),
    ).toThrow(`Invalid birthday: the year must be 0000 to 9999 (got ${year})`)
  })

  it('should throw on an invalid Date', () => {
    expect(() =>
      assertValidDate({ date: new Date('x'), label: 'revision' }),
    ).toThrow('Invalid revision: the Date is invalid')
  })

  it('should throw on a value that is not a Date', () => {
    expect(() =>
      assertValidDate({
        date: '2024-01-01' as unknown as Date,
        label: 'revision',
      }),
    ).toThrow('Invalid revision: must be a Date (got string)')
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

  it('should escape control characters in the message', () => {
    expect(() => assertName({ value: 'X\x85A', label: 'Group' })).toThrow(
      'Group values can contain only letters, digits and "-" ("X\\u0085A")',
    )
  })
})
