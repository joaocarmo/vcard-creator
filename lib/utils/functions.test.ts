import { escape, fold, isValidMimeType, resolveType } from './functions'

describe("testing the 'escape' function", () => {
  it('should convert CRLF to LF', () => {
    expect(escape('\r\n')).toEqual('\\n')
  })

  it('should escape newline characters', () => {
    expect(escape('\n')).toEqual('\\n')
  })
})

describe("testing the 'fold' function", () => {
  it('should return an empty string for an empty string', () => {
    expect(fold('')).toEqual('')
  })

  it('should return the same text if it has 75 characters or fewer', () => {
    const testString =
      'should return the same text if it has 75 characters or fewer'
    expect(fold(testString)).toEqual(testString)
  })

  it('should fold a line according to RFC2425 section 5.8.1.', () => {
    const bigString =
      'lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua'
    const splitString =
      'lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tem\r\n por incididunt ut labore et dolore magna aliqua\r\n'
    expect(fold(bigString)).toEqual(splitString)
  })
})

describe("testing the 'isValidMimeType' function", () => {
  it('should be true if the supplied mime type is valid', () => {
    expect(isValidMimeType('jpeg')).toBe(true)
  })

  it('should be false if the supplied mime type is invalid', () => {
    expect(isValidMimeType('foobar')).toBe(false)
  })
})

describe("testing the 'resolveType' function", () => {
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
