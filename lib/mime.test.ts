import {
  isValidMimeType,
  MIME_TYPES,
  toImageSubtype,
  toMediaInput,
  toMimeEssence,
} from './mime'

describe('toMimeEssence()', () => {
  it.each([
    [' image/png ', 'image/png'],
    ['png;a=b', 'png'],
    ['\t\r\npng \n', 'png'],
    ['; charset=binary', ''],
    [' png', ' png'],
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

  it.each(['', 'foobar', 'jpg', 'image/png', 'x-', 'x_icon', 'pjpeg'])(
    'should reject %j',
    (mime) => {
      expect(isValidMimeType(mime)).toBe(false)
    },
  )

  it('should store every MIME_TYPES entry in lower case', () => {
    const notLowerCase = [...MIME_TYPES].filter(
      (mime) => mime !== mime.toLowerCase(),
    )
    expect(notLowerCase).toEqual([])
  })
})

describe.each(['photo', 'logo'] as const)('toMediaInput(%j)', (element) => {
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
    expect(() => typeOf(mime)).toThrow('MIME Media Type values must be strings')
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
        `The MIME Media Type is invalid (${JSON.stringify(mime)})`,
      )
    },
  )
})
