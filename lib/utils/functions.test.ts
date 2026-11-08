import {
  assertUri,
  escapeText,
  fold,
  formatFloat,
  isValidMimeType,
  quoteParamValue,
  resolveType,
  toImageSubtype,
} from './functions'
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
  })

  it('should throw on a double quote', () => {
    expect(() => quoteParamValue('a"b')).toThrow(VCardException)
  })

  it('should throw on a control character', () => {
    expect(() => quoteParamValue('a\r\nEMAIL:x')).toThrow(VCardException)
    expect(() => quoteParamValue('a\nb')).toThrow(VCardException)
    expect(() => quoteParamValue('a\x00b')).toThrow(VCardException)
    expect(() => quoteParamValue('a\x7Fb')).toThrow(VCardException)
  })

  it('should allow a horizontal tab', () => {
    expect(quoteParamValue('a\tb')).toEqual('a\tb')
  })
})

describe('assertUri()', () => {
  it('should accept a URI with a comma and a semicolon', () => {
    expect(() => assertUri('https://example.com/a;b?c=1,2')).not.toThrow()
  })

  it.each(['\n', '\r', '\r\n', '\t', '\x00', '\x7F'])(
    'should throw on control character %j',
    (char) => {
      expect(() => assertUri(`https://example.com/a${char}b`)).toThrow(
        VCardException,
      )
    },
  )
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

describe('isValidMimeType()', () => {
  it('should return true for a valid MIME type', () => {
    expect(isValidMimeType('jpeg')).toBe(true)
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
})
