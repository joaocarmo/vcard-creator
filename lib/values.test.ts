import { VALUE_PIPELINES } from './values'
import VCardException from './VCardException'
import type { ValueType } from './properties'

describe('VALUE_PIPELINES', () => {
  const run = (type: ValueType, value: unknown, label = 'Label') =>
    VALUE_PIPELINES[type](value, label)

  describe('text', () => {
    it('should escape the value', () => {
      expect(run('text', 'a;b,c\\d\ne')).toBe('a\\;b\\,c\\\\d\\ne')
    })
  })

  describe('text-structured', () => {
    it('should escape each component and join with a semicolon', () => {
      expect(run('text-structured', ['a;b', '', 'c'])).toBe('a\\;b;;c')
    })

    it('should escape commas and backslashes in each component', () => {
      expect(run('text-structured', ['Doe, Jr.', 'C:\\x'])).toBe(
        'Doe\\, Jr.;C:\\\\x',
      )
    })

    it('should throw on a non-string component', () => {
      expect(() => run('text-structured', ['a', null])).toThrow(
        'Label values must be strings (got null)',
      )
    })
  })

  describe('text-list', () => {
    it('should escape each entry and join with a comma', () => {
      expect(run('text-list', ['a,b', 'c'])).toBe('a\\,b,c')
    })

    it('should keep leading and trailing spaces', () => {
      expect(run('text-list', [' a', 'b '])).toBe(' a,b ')
    })

    it('should escape semicolons and backslashes in each entry', () => {
      expect(run('text-list', ['a;b', 'c\\d'])).toBe('a\\;b,c\\\\d')
    })

    it('should throw on a non-string entry', () => {
      expect(() => run('text-list', ['a', 42])).toThrow(
        'Label values must be strings (got number)',
      )
    })

    it('should throw on a non-array value', () => {
      expect(() => run('text-list', 'a')).toThrow(VCardException)
    })
  })

  describe('uri', () => {
    it('should keep the value as it is', () => {
      expect(run('uri', 'https://example.com/a;b?c=1,2')).toBe(
        'https://example.com/a;b?c=1,2',
      )
    })
  })

  describe('raw', () => {
    it('should keep the value as it is', () => {
      expect(run('raw', 'a;b,c')).toBe('a;b,c')
    })

    it('should throw on a tab', () => {
      expect(() => run('raw', 'a\tb')).toThrow(VCardException)
    })
  })

  describe('binary', () => {
    it.each(['', 'AAAA', 'ab+/', 'QUJD', 'QUI=', 'QQ==', 'QUJDRA=='])(
      'should keep valid base64 %j as it is',
      (value) => {
        expect(run('binary', value)).toBe(value)
      },
    )

    it.each(['-', '_', '.', '!', ':', ';', ',', 'é'])(
      'should throw on the character %j with the label and the value',
      (char) => {
        expect(() => run('binary', `AAA${char}`)).toThrow(
          `Label values must be base64 (got ${JSON.stringify(`AAA${char}`)})`,
        )
      },
    )

    it.each(['data:image/png;base64,AAAA', 'DATA:image/png;base64,AAAA'])(
      'should throw on the data URL %j',
      (value) => {
        expect(() => run('binary', value)).toThrow(VCardException)
      },
    )

    it.each(['A', 'AA', 'AAA', 'AA=', 'A===', '=AAA', 'AA==AAAA', 'AAAAA'])(
      'should throw on wrong padding %j',
      (value) => {
        expect(() => run('binary', value)).toThrow(VCardException)
      },
    )

    it.each([
      ['AAAA\nBBBB', 'AAAABBBB'],
      ['AAAA\r\nBBBB\r\n', 'AAAABBBB'],
      // A folded line
      ['AAAA\r\n BBBB', 'AAAABBBB'],
      ['AAAA BBBB', 'AAAABBBB'],
      ['AAAA\tBB==', 'AAAABB=='],
      [' AAAA ', 'AAAA'],
    ])('should remove whitespace from %j', (value, expected) => {
      expect(run('binary', value)).toBe(expected)
    })

    it('should check a value of several MB', () => {
      const value = 'A'.repeat(8_000_000)

      expect(run('binary', value)).toBe(value)
      expect(() => run('binary', `${value}A`)).toThrow(VCardException)
    })

    it('should accept GNU base64 output wrapped at 76 characters', () => {
      const line = 'A'.repeat(76)
      expect(run('binary', `${line}\n${line}\nQQ==\n`)).toBe(
        `${line}${line}QQ==`,
      )
    })

    // VT, FF and NBSP would be removed by `\s`
    it.each([
      '\x00',
      '\x0B',
      '\x0C',
      '\x7F',
      '\x85',
      '\xA0',
      '\u{2028}',
      '\u{3000}',
    ])('should throw on %j', (char) => {
      expect(() => run('binary', `AA${char}AA`)).toThrow(
        'Label values must be base64',
      )
    })

    it('should throw on a non-string', () => {
      expect(() => run('binary', 42)).toThrow(
        'Label values must be strings (got number)',
      )
    })
  })

  describe('raw-tab', () => {
    it('should allow a tab', () => {
      expect(run('raw-tab', 'a\tb')).toBe('a\tb')
    })

    it('should throw on a line break', () => {
      expect(() => run('raw-tab', 'a\nb')).toThrow(VCardException)
    })
  })

  describe('date-or-date-time', () => {
    it('should write a Date as a date', () => {
      expect(
        run('date-or-date-time', new Date('1990-05-15T12:00:00Z'), 'Birthday'),
      ).toBe('1990-05-15')
    })

    it.each([
      ['0000-01-01T00:00:00Z', '0000-01-01'],
      ['9999-12-31T00:00:00Z', '9999-12-31'],
    ])('should write a Date at the year limit (%s)', (iso, expected) => {
      expect(run('date-or-date-time', new Date(iso), 'Birthday')).toBe(expected)
    })

    it.each(['1990-05-15', '19900515', '1953-10-15T23:10:00Z'])(
      'should keep %j as it is',
      (value) => {
        expect(run('date-or-date-time', value, 'Birthday')).toBe(value)
      },
    )

    it('should throw on an invalid string', () => {
      expect(() => run('date-or-date-time', '1990-02-30', 'Birthday')).toThrow(
        VCardException,
      )
    })

    it('should throw on a trailing line break', () => {
      expect(() =>
        run('date-or-date-time', '1990-05-15\n', 'Birthday'),
      ).toThrow(VCardException)
    })

    it('should throw on a non-string, non-Date value', () => {
      expect(() => run('date-or-date-time', 42, 'Birthday')).toThrow(
        'Birthday values must be strings or Dates (got number)',
      )
    })

    it('should throw on an invalid Date', () => {
      expect(() => run('date-or-date-time', new Date('x'), 'Birthday')).toThrow(
        VCardException,
      )
    })
  })

  describe('date-time', () => {
    it('should write a Date as a date-time', () => {
      expect(
        run('date-time', new Date('2024-01-02T03:04:05Z'), 'Revision'),
      ).toBe('2024-01-02T03:04:05Z')
    })

    it('should keep a date-time string as it is', () => {
      expect(run('date-time', '1953-10-15T23:10:00Z', 'Birthday')).toBe(
        '1953-10-15T23:10:00Z',
      )
    })

    it('should throw on an invalid string', () => {
      expect(() =>
        run('date-time', '1953-10-15T25:10:00Z', 'Birthday'),
      ).toThrow(VCardException)
    })

    it('should throw on a non-string, non-Date value', () => {
      expect(() => run('date-time', 42, 'Revision')).toThrow(VCardException)
    })

    it('should throw on an invalid Date', () => {
      expect(() => run('date-time', new Date('x'), 'Revision')).toThrow(
        VCardException,
      )
    })
  })

  describe('utc-offset', () => {
    it.each(['+00:00', '-05:00', '+14:00', '+23:59'])(
      'should keep %j',
      (value) => {
        expect(run('utc-offset', value, 'Timezone')).toBe(value)
      },
    )

    it.each(['+24:00', '-25:00', '+05:60', '+99:99', 'Europe/Lisbon'])(
      'should throw on %j',
      (value) => {
        expect(() => run('utc-offset', value, 'Timezone')).toThrow(
          VCardException,
        )
      },
    )
  })

  describe('float-pair', () => {
    it('should write latitude and longitude', () => {
      expect(run('float-pair', { latitude: 1e-7, longitude: -180 })).toBe(
        '0.0000001;-180',
      )
    })

    it('should accept the boundary values', () => {
      expect(run('float-pair', { latitude: -90, longitude: 180 })).toBe(
        '-90;180',
      )
    })

    it.each([
      ['latitude', 91, 90],
      ['latitude', -91, 90],
      ['longitude', 181, 180],
      ['longitude', -181, 180],
    ])('should throw on %s %s', (name, value) => {
      expect(() =>
        run('float-pair', { latitude: 0, longitude: 0, [name]: value }),
      ).toThrow(VCardException)
    })

    const nonFiniteValues: [string, unknown][] = [
      ['NaN', NaN],
      ['Infinity', Infinity],
      ['-Infinity', -Infinity],
      ["'abc'", 'abc'],
      ["'45'", '45'],
      ['null', null],
      ['undefined', undefined],
      ['{}', {}],
      ["Symbol('x')", Symbol('x')],
      ['Object.create(null)', Object.create(null)],
    ]

    it.each(
      ['latitude', 'longitude'].flatMap((name) =>
        nonFiniteValues.map(([shown, value]) => [name, shown, value] as const),
      ),
    )('should throw on %s %s', (name, _, value) => {
      expect(() =>
        run('float-pair', { latitude: 0, longitude: 0, [name]: value }),
      ).toThrow(VCardException)
    })
  })
})
