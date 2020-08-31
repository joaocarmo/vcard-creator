import {
  b64encode, chunkSplit, escape, fold,
} from '../functions'

describe("testing the 'b64encode' function", () => {
  it('should return an empty string, given an empty string', () => {
    expect(b64encode('')).toEqual('')
  })

  it('should encode data with MIME base64', () => {
    const string = 'quoth the raven nevermore'
    const b64string = 'cXVvdGggdGhlIHJhdmVuIG5ldmVybW9yZQ=='
    expect(b64encode(string)).toEqual(b64string)
  })
})

describe("testing the 'chunkSplit' function", () => {
  it('should split a string into smaller chunks', () => {
    const bigString = 'lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua'
    const splitString = 'lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod temp\r\nor incididunt ut labore et dolore magna aliqua\r\n'
    expect(chunkSplit(bigString)).toBe(splitString)
  })

  it("should match 'fold' given the right arguments", () => {
    const bigString = 'lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua'
    expect(chunkSplit(bigString, 73, '\r\n ').trim()).toBe(fold(bigString).trim())
  })
})

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

  const description = 'should return the same text if it has 75 characters or fewer'
  it(description, () => {
    expect(fold(description)).toEqual(description)
  })

  it('should fold a line according to RFC2425 section 5.8.1.', () => {
    const bigString = 'lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua'
    const splitString = 'lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod t\r\n empor incididunt ut labore et dolore magna aliqua\r\n'
    expect(fold(bigString)).toEqual(splitString)
  })
})
