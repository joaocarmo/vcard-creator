import {
  isValidMimeType,
  MIME_TYPES,
  toImageSubtype,
  toMediaInput,
  toMimeEssence,
  trimHttpWhitespace,
} from './mime'

// Built from code points so the source stays ASCII
const NO_BREAK_SPACE = String.fromCharCode(0xa0)
const KELVIN_SIGN = String.fromCharCode(0x212a)

describe('trimHttpWhitespace()', () => {
  it.each(['\t', '\n', '\r', ' '])('should trim %j at both ends', (char) => {
    expect(trimHttpWhitespace(`${char}${char}a${char}`)).toBe('a')
  })

  it.each([
    ['a b\tc', 'a b\tc'],
    ['\va\f', '\va\f'],
    [
      `${NO_BREAK_SPACE}a${NO_BREAK_SPACE}`,
      `${NO_BREAK_SPACE}a${NO_BREAK_SPACE}`,
    ],
  ])('should keep %j as %j', (value, expected) => {
    expect(trimHttpWhitespace(value)).toBe(expected)
  })

  it('should keep a long run of inner whitespace in linear time', () => {
    const value = `a${' '.repeat(100_000)}a`

    expect(trimHttpWhitespace(` ${value} `)).toBe(value)
  })
})

describe('toMimeEssence()', () => {
  it.each([
    [' image/png ', 'image/png'],
    ['png;a=b', 'png'],
    ['\t\r\npng \n', 'png'],
    ['; charset=binary', ''],
    // A no-break space is not HTTP whitespace
    [`${NO_BREAK_SPACE}png`, `${NO_BREAK_SPACE}png`],
  ])('should map %j to %j', (mime, expected) => {
    expect(toMimeEssence(mime)).toBe(expected)
  })
})

describe('toImageSubtype()', () => {
  it.each([
    [' png', 'png'],
    ['image/png; charset=binary', 'png'],
    ['\timage/png \n', 'png'],
    ['image/x-icon', 'x-icon'],
    ['png', 'png'],
    ['image/png', 'png'],
    ['IMAGE/PNG', 'PNG'],
    ['jpg', 'jpeg'],
    ['JPG', 'jpeg'],
    ['image/jpg', 'jpeg'],
    ['svg+xml', 'svg+xml'],
    ['vnd.sealedmedia.softseal.jpg', 'vnd.sealedmedia.softseal.jpg'],
  ])('should map %j to %j', (mime, expected) => {
    expect(toImageSubtype(mime)).toBe(expected)
  })
})

describe('isValidMimeType()', () => {
  it.each([
    'jpeg',
    'PNG',
    'svg+xml',
    'vnd.microsoft.icon',
    'x-icon',
    'X-MS-BMP',
  ])('should accept %j', (mime) => {
    expect(isValidMimeType(mime)).toBe(true)
  })

  it.each([
    '',
    'foobar',
    'jpg',
    'image/png',
    'x-',
    'x_icon',
    'pjpeg',
    // The Kelvin sign lower-cases to an ASCII "k"
    `hej2${KELVIN_SIGN}`,
  ])('should reject %j', (mime) => {
    expect(isValidMimeType(mime)).toBe(false)
  })

  it('should store every MIME_TYPES entry in lower case', () => {
    const notLowerCase = [...MIME_TYPES].filter(
      (mime) => mime !== mime.toLowerCase(),
    )
    expect(notLowerCase).toEqual([])
  })
})

describe.each(['photo', 'logo'] as const)('toMediaInput(%j)', (element) => {
  const label = element === 'photo' ? 'Photo' : 'Logo'

  // Returns the TYPE parameter value of an embedded image
  const typeOf = (mime?: unknown) => {
    const input = toMediaInput(element, {
      image: 'data',
      mime: mime as string,
    })
    const [param] = input.params ?? []
    return param?.kind === 'single' ? param.value : undefined
  }

  it('should map a URL to a uri value', () => {
    expect(toMediaInput(element, { url: 'https://example.com/a' })).toEqual({
      element,
      valueType: 'uri',
      value: 'https://example.com/a',
    })
  })

  it('should map an image with `url: undefined` to the image', () => {
    expect(toMediaInput(element, { image: 'data', url: undefined })).toEqual({
      element,
      value: 'data',
      params: [{ kind: 'single', name: 'TYPE', value: 'JPEG', upper: true }],
    })
  })

  it('should map an image to the default value type with an upper-case TYPE', () => {
    expect(toMediaInput(element, { image: 'data', mime: 'png' })).toEqual({
      element,
      value: 'data',
      params: [{ kind: 'single', name: 'TYPE', value: 'png', upper: true }],
    })
  })

  it('should convert the MIME type to an image subtype', () => {
    expect(typeOf('image/jpg')).toBe('jpeg')
  })

  it.each([
    ['undefined', undefined],
    ['null', null],
  ])('should default to JPEG when mime is %s', (_, mime) => {
    expect(typeOf(mime)).toBe('JPEG')
  })

  it.each([
    ['42', 42],
    ['{}', {}],
    ['true', true],
    ['[]', []],
    ["Symbol('x')", Symbol('x')],
  ])('should throw on a non-string mime (%s)', (_, mime) => {
    expect(() => typeOf(mime)).toThrow(
      `${label} MIME type values must be strings`,
    )
  })

  it.each(['', '  ', '; charset=binary'])(
    'should write no TYPE when the essence of mime is empty (%j)',
    (mime) => {
      expect(toMediaInput(element, { image: 'data', mime })).toEqual({
        element,
        value: 'data',
      })
    },
  )

  it.each(['foobar', 'image/foo', 'image/', 'jpgx', 'image/pjpeg'])(
    'should throw on %j with the original value',
    (mime) => {
      expect(() => typeOf(mime)).toThrow(
        `${label} MIME type values must be an image type (got ${JSON.stringify(mime)})`,
      )
    },
  )
})
