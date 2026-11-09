import {
  buildKey,
  escapeText,
  fold,
  formatDateTime,
  formatFloat,
  quoteParamValue,
  resolveType,
} from './format'
import VCardException from './VCardException'
import type { BuildKeyOptions } from './format'

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
    expect(() => quoteParamValue('a"b')).toThrow(
      'Parameter values cannot contain a double quote ("a\\"b")',
    )
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

describe('formatDateTime()', () => {
  it('should drop the milliseconds', () => {
    expect(formatDateTime(new Date('2024-01-15T10:30:00.000Z'))).toEqual(
      '2024-01-15T10:30:00Z',
    )
  })

  it('should cut the milliseconds without rounding', () => {
    expect(formatDateTime(new Date('2024-01-15T10:30:59.999Z'))).toEqual(
      '2024-01-15T10:30:59Z',
    )
  })

  it('should write year 0000 with 4 digits', () => {
    expect(formatDateTime(new Date('0000-01-01T00:00:00Z'))).toEqual(
      '0000-01-01T00:00:00Z',
    )
  })
})

describe('escapeText()', () => {
  const escape = (text: string) => escapeText({ value: text, label: 'Note' })

  it.each([undefined, null, 42, {}])(
    'should throw on a non-string value (%s)',
    (value) => {
      expect(() => escape(value as unknown as string)).toThrow(
        'Note values must be strings',
      )
    },
  )

  it('should name an array as an array', () => {
    expect(() => escape([] as unknown as string)).toThrow(
      'Note values must be strings (got array)',
    )
  })

  it('should escape backslashes first', () => {
    expect(escape('C:\\Users')).toEqual('C:\\\\Users')
  })

  it('should escape semicolons', () => {
    expect(escape('a;b')).toEqual('a\\;b')
  })

  it('should escape commas', () => {
    expect(escape('a,b')).toEqual('a\\,b')
  })

  it('should escape CRLF newlines', () => {
    expect(escape('\r\n')).toEqual('\\n')
  })

  it('should escape LF newlines', () => {
    expect(escape('\n')).toEqual('\\n')
  })

  it('should escape a lone CR', () => {
    expect(escape('a\rb')).toEqual('a\\nb')
  })

  it('should escape each line break in a sequence', () => {
    expect(escape('\n\r')).toEqual('\\n\\n')
    expect(escape('\r\n\r\n')).toEqual('\\n\\n')
  })

  it('should handle combined special characters', () => {
    expect(escape('a;b,c\\d\ne')).toEqual('a\\;b\\,c\\\\d\\ne')
  })

  it('should escape backslash before semicolon to avoid double-escaping', () => {
    expect(escape('a\\;b')).toEqual('a\\\\\\;b')
  })

  it('should pass through strings with no special characters', () => {
    expect(escape('hello world')).toEqual('hello world')
  })

  it('should pass through empty string', () => {
    expect(escape('')).toEqual('')
  })

  it.each(['\x00', '\x08', '\x0E', '\x1C', '\x1E', '\x1F', '\x7F'])(
    'should throw on control character %j',
    (char) => {
      expect(() => escape(`a${char}b`)).toThrow(VCardException)
    },
  )

  it('should name the character in the message', () => {
    expect(() => escape('a\x01b')).toThrow(
      'Note values cannot contain control characters ("a\\u0001b")',
    )
    expect(() => escape('a\x7Fb')).toThrow(
      'Note values cannot contain control characters ("a\\u007fb")',
    )
  })

  it.each(['\x0B', '\x0C', '\x85', '\u{2028}', '\u{2029}'])(
    'should escape %j as a line break',
    (char) => {
      expect(escape(`a${char}b`)).toEqual('a\\nb')
    },
  )

  it('should count CRLF as one line break and VT as another', () => {
    expect(escape('a\r\n\x0Bb')).toEqual('a\\n\\nb')
  })

  it.each(['\t', '\x80', '\x9F', 'é', '漢', '😀'])(
    'should pass through %j',
    (char) => {
      expect(escape(`a${char}b`)).toEqual(`a${char}b`)
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

describe('buildKey()', () => {
  const key = (options: Partial<BuildKeyOptions> = {}) =>
    buildKey({ name: 'X', valueType: 'text', defaultType: 'text', ...options })

  it('should write the name alone without parameters', () => {
    expect(key()).toBe('X')
  })

  it('should write VALUE when the RFC value type is not the default', () => {
    expect(key({ valueType: 'uri', defaultType: 'binary' })).toBe('X;VALUE=uri')
    expect(key({ valueType: 'text', defaultType: 'utc-offset' })).toBe(
      'X;VALUE=text',
    )
  })

  it('should treat the structured and list pipelines as RFC text', () => {
    expect(key({ valueType: 'text-list', defaultType: 'text' })).toBe('X')
  })

  it('should write ENCODING=b for binary values', () => {
    expect(key({ valueType: 'binary', defaultType: 'binary' })).toBe(
      'X;ENCODING=b',
    )
  })

  describe('list parameters', () => {
    it('should quote and uppercase each entry', () => {
      expect(
        key({
          params: [{ kind: 'list', value: ['work', 'a,b'] }],
        }),
      ).toBe('X;TYPE=WORK,"A,B"')
    })

    it('should leave out an empty array', () => {
      expect(key({ params: [{ kind: 'list', value: [] }] })).toBe('X')
    })

    it('should throw on a non-array value', () => {
      expect(() => key({ params: [{ kind: 'list', value: 'work' }] })).toThrow(
        'Type values must be an array (got string)',
      )
    })
  })

  describe('single parameters', () => {
    it('should keep the name and value case unless upper is set', () => {
      expect(
        key({
          params: [
            { kind: 'single', name: 'type', value: 'LinkedIn' },
            { kind: 'single', name: 'TYPE', value: 'pgp', upper: true },
          ],
        }),
      ).toBe('X;type=LinkedIn;TYPE=PGP')
    })

    it('should quote a value with a colon', () => {
      expect(
        key({ params: [{ kind: 'single', name: 'x-user', value: 'a:b' }] }),
      ).toBe('X;x-user="a:b"')
    })

    it('should write an empty string', () => {
      expect(
        key({ params: [{ kind: 'single', name: 'TYPE', value: '' }] }),
      ).toBe('X;TYPE=')
    })

    it('should throw on an array', () => {
      expect(() =>
        key({ params: [{ kind: 'single', name: 'TYPE', value: ['a'] }] }),
      ).toThrow('Parameter values must be strings (got array)')
    })
  })

  describe('raw parameters', () => {
    it('should write them as they are', () => {
      expect(key({ rawParams: 'TYPE=work;X-A=b' })).toBe('X;TYPE=work;X-A=b')
    })

    it('should leave out an empty string', () => {
      expect(key({ rawParams: '' })).toBe('X')
    })

    it('should allow a tab and throw on a line break', () => {
      expect(key({ rawParams: 'X-A=a\tb' })).toBe('X;X-A=a\tb')
      expect(() => key({ rawParams: 'X-A=a\nb' })).toThrow(
        'Parameter values cannot contain control characters ("X-A=a\\nb")',
      )
    })

    it.each([
      'X-L="a:b"',
      'TYPE=work,home',
      'TYPE=work;X-A=1',
      'X-L=',
      'TYPE=a,',
      'X-L=ä',
      'X-A="c\td"',
    ])('should write %j as it is', (rawParams) => {
      expect(key({ rawParams })).toBe(`X;${rawParams}`)
    })

    it.each([
      'X-L=a:b',
      'X-L=a"b',
      'WORK',
      '=a',
      'X-L',
      'X L=a',
      'X-L=a;',
      'X-L="a',
      'X-L="a"b',
    ])('should throw on %j', (rawParams) => {
      expect(() => key({ rawParams })).toThrow(VCardException)
    })

    it('should explain the grammar in the error', () => {
      expect(() => key({ rawParams: 'X-L=a:b' })).toThrow(
        'Parameters must be name=value pairs separated by ";". Put a value with ";", ":" or "," in double quotes. A value cannot contain a double quote ("X-L=a:b")',
      )
    })
  })
})
