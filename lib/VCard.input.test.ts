import { runInNewContext } from 'node:vm'
import VCard from './VCard'
import VCardException from './VCardException'
import type { AddressType, EmailType, PhoneType, UrlType } from './types/VCard'
import { addMethods } from '../test/helpers'

type AddMethod = Extract<keyof VCard, `add${string}`>
// `s` is appended to 1 string input. The other inputs are valid.
type StringCall = (card: VCard, s: string) => unknown
// `v` replaces 1 input, or the whole options argument
type ValueCall = (card: VCard, v: never) => unknown

interface MethodCases {
  strings: StringCall[]
  /** Inputs without a default */
  required: ValueCall[]
  /** Inputs with a default, which `undefined` selects */
  optional?: ValueCall[]
  /** Left out when the argument is the value itself */
  options?: ValueCall
  /** Escapes text values */
  text?: true
}

const url = 'https://example.com'

// Every message names the input, states the rule and shows the rejected value
const MESSAGE_STYLE = /^.+ (values|options) must .+ \(got .+\)$/

const expectStyledThrow = (call: () => unknown) => {
  expect(call).toThrow(VCardException)
  expect(call).toThrow(MESSAGE_STYLE)
}

// 1 entry per public add*() method
const cases: Record<AddMethod, MethodCases> = {
  addAddress: {
    strings: [
      (c, s) => c.addAddress({ postOfficeBox: s }),
      (c, s) => c.addAddress({ extended: s }),
      (c, s) => c.addAddress({ street: s }),
      (c, s) => c.addAddress({ locality: s }),
      (c, s) => c.addAddress({ region: s }),
      (c, s) => c.addAddress({ postalCode: s }),
      (c, s) => c.addAddress({ country: s }),
      (c, s) => c.addAddress({ type: [`home${s}` as AddressType] }),
    ],
    required: [],
    optional: [
      (c, v) => c.addAddress({ postOfficeBox: v }),
      (c, v) => c.addAddress({ extended: v }),
      (c, v) => c.addAddress({ street: v }),
      (c, v) => c.addAddress({ locality: v }),
      (c, v) => c.addAddress({ region: v }),
      (c, v) => c.addAddress({ postalCode: v }),
      (c, v) => c.addAddress({ country: v }),
    ],
    options: (c, v) => c.addAddress(v),
    text: true,
  },
  addBirthday: {
    strings: [(c, s) => c.addBirthday(`1990-05-15${s}`)],
    required: [(c, v) => c.addBirthday(v)],
  },
  addCompany: {
    strings: [
      (c, s) => c.addCompany({ name: `Acme${s}` }),
      (c, s) => c.addCompany({ name: 'Acme', department: `Dev${s}` }),
    ],
    required: [(c, v) => c.addCompany({ name: v })],
    optional: [(c, v) => c.addCompany({ name: 'Acme', department: v })],
    options: (c, v) => c.addCompany(v),
    text: true,
  },
  addEmail: {
    strings: [
      (c, s) => c.addEmail({ address: `a@example.com${s}` }),
      (c, s) =>
        c.addEmail({
          address: 'a@example.com',
          type: [`work${s}` as EmailType],
        }),
    ],
    required: [(c, v) => c.addEmail({ address: v })],
    options: (c, v) => c.addEmail(v),
    text: true,
  },
  addKey: {
    strings: [
      (c, s) => c.addKey({ url: `https://example.com/k${s}` }),
      (c, s) => c.addKey({ key: `data${s}` }),
      (c, s) => c.addKey({ key: 'data', mime: `PGP${s}` }),
      (c, s) => c.addKey({ text: `abc${s}` }),
      (c, s) => c.addKey({ text: 'abc', mime: `PGP${s}` }),
    ],
    required: [
      (c, v) => c.addKey({ url: v }),
      (c, v) => c.addKey({ key: v }),
      (c, v) => c.addKey({ text: v }),
    ],
    options: (c, v) => c.addKey(v),
    text: true,
  },
  addJobtitle: {
    strings: [(c, s) => c.addJobtitle(s)],
    required: [(c, v) => c.addJobtitle(v)],
    text: true,
  },
  addRole: {
    strings: [(c, s) => c.addRole(s)],
    required: [(c, v) => c.addRole(v)],
    text: true,
  },
  addFullName: {
    strings: [(c, s) => c.addFullName(s)],
    required: [(c, v) => c.addFullName(v)],
    text: true,
  },
  addName: {
    strings: [
      (c, s) => c.addName({ familyName: s }),
      (c, s) => c.addName({ givenName: s }),
      (c, s) => c.addName({ additionalNames: s }),
      (c, s) => c.addName({ honorificPrefix: s }),
      (c, s) => c.addName({ honorificSuffix: s }),
    ],
    required: [],
    optional: [
      (c, v) => c.addName({ familyName: v }),
      (c, v) => c.addName({ givenName: v }),
      (c, v) => c.addName({ additionalNames: v }),
      (c, v) => c.addName({ honorificPrefix: v }),
      (c, v) => c.addName({ honorificSuffix: v }),
    ],
    options: (c, v) => c.addName(v),
    text: true,
  },
  addNickname: {
    strings: [(c, s) => c.addNickname(s), (c, s) => c.addNickname(['Jo', s])],
    required: [(c, v) => c.addNickname(v), (c, v) => c.addNickname(['Jo', v])],
    text: true,
  },
  addNote: {
    strings: [(c, s) => c.addNote(s)],
    required: [(c, v) => c.addNote(v)],
    text: true,
  },
  addCategories: {
    strings: [(c, s) => c.addCategories(['Work', s])],
    required: [
      (c, v) => c.addCategories(v),
      (c, v) => c.addCategories(['Work', v]),
    ],
    text: true,
  },
  addPhoneNumber: {
    strings: [
      (c, s) => c.addPhoneNumber({ number: `+1-555-0100${s}` }),
      (c, s) =>
        c.addPhoneNumber({
          number: '+1-555-0100',
          type: [`cell${s}` as PhoneType],
        }),
    ],
    // `number` also accepts a number, so it has its own test
    required: [],
    options: (c, v) => c.addPhoneNumber(v),
  },
  addLogo: {
    strings: [
      (c, s) => c.addLogo({ url: `https://example.com/l${s}` }),
      (c, s) => c.addLogo({ image: `data${s}` }),
      (c, s) => c.addLogo({ image: 'data', mime: `png${s}` }),
    ],
    required: [
      (c, v) => c.addLogo({ url: v }),
      (c, v) => c.addLogo({ image: v }),
    ],
    options: (c, v) => c.addLogo(v),
  },
  addPhoto: {
    strings: [
      (c, s) => c.addPhoto({ url: `https://example.com/p${s}` }),
      (c, s) => c.addPhoto({ image: `data${s}` }),
      (c, s) => c.addPhoto({ image: 'data', mime: `png${s}` }),
    ],
    required: [
      (c, v) => c.addPhoto({ url: v }),
      (c, v) => c.addPhoto({ image: v }),
    ],
    options: (c, v) => c.addPhoto(v),
  },
  addUrl: {
    strings: [
      (c, s) => c.addUrl({ url: `https://example.com/${s}` }),
      (c, s) =>
        c.addUrl({
          url: 'https://example.com',
          type: [`work${s}` as UrlType],
        }),
    ],
    required: [(c, v) => c.addUrl({ url: v })],
    options: (c, v) => c.addUrl(v),
  },
  addSocial: {
    strings: [
      (c, s) => c.addSocial({ url: `https://example.com/${s}`, type: 'x' }),
      (c, s) => c.addSocial({ url: 'https://example.com', type: `x${s}` }),
      (c, s) =>
        c.addSocial({ url: 'https://example.com', type: 'x', user: `u${s}` }),
    ],
    required: [
      (c, v) => c.addSocial({ url: v, type: 'x' }),
      (c, v) => c.addSocial({ url, type: v }),
    ],
    optional: [(c, v) => c.addSocial({ url, type: 'x', user: v })],
    options: (c, v) => c.addSocial(v),
  },
  addImpp: {
    strings: [
      (c, s) => c.addImpp({ uri: `xmpp:a@example.com${s}` }),
      (c, s) =>
        c.addImpp({ uri: 'xmpp:a@example.com', serviceType: `Jabber${s}` }),
    ],
    required: [(c, v) => c.addImpp({ uri: v })],
    optional: [(c, v) => c.addImpp({ uri: url, serviceType: v })],
    options: (c, v) => c.addImpp(v),
  },
  addUid: {
    strings: [(c, s) => c.addUid(`uid${s}`)],
    required: [(c, v) => c.addUid(v)],
    text: true,
  },
  addGeo: {
    strings: [],
    // Covered by the float-pair pipeline tests
    required: [],
    options: (c, v) => c.addGeo(v),
  },
  addTimezone: {
    strings: [(c, s) => c.addTimezone(`Europe/Lisbon${s}`)],
    required: [(c, v) => c.addTimezone(v)],
    text: true,
  },
  addSortString: {
    strings: [(c, s) => c.addSortString(s)],
    required: [(c, v) => c.addSortString(v)],
    text: true,
  },
  addRevision: {
    strings: [],
    required: [(c, v) => c.addRevision(v)],
  },
  addLabel: {
    strings: [
      (c, s) => c.addLabel({ label: `Street 1${s}` }),
      (c, s) =>
        c.addLabel({ label: 'Street 1', type: [`home${s}` as AddressType] }),
    ],
    required: [(c, v) => c.addLabel({ label: v })],
    options: (c, v) => c.addLabel(v),
    text: true,
  },
  addCustomProperty: {
    strings: [
      (c, s) => c.addCustomProperty({ name: `X-A${s}`, value: 'v' }),
      (c, s) => c.addCustomProperty({ name: 'X-A', value: s }),
      (c, s) =>
        c.addCustomProperty({ name: 'X-A', value: 'v', params: `X-P=1${s}` }),
      (c, s) =>
        c.addCustomProperty({ name: 'X-A', value: 'v', group: `item1${s}` }),
    ],
    required: [
      (c, v) => c.addCustomProperty({ name: v, value: 'v' }),
      (c, v) => c.addCustomProperty({ name: 'X-A', value: v }),
    ],
    optional: [
      (c, v) => c.addCustomProperty({ name: 'X-A', value: 'v', params: v }),
      (c, v) => c.addCustomProperty({ name: 'X-A', value: 'v', group: v }),
    ],
    options: (c, v) => c.addCustomProperty(v),
  },
}

const entries = Object.entries(cases) as [AddMethod, MethodCases][]

it('should cover every public add*() method', () => {
  expect(Object.keys(cases).sort()).toEqual([...addMethods].sort())
})

describe('line breaks in every string input', () => {
  // Runs `call` on a fresh card. Returns the output, or null when the call
  // threw a VCardException and stored nothing.
  const outputOrReject = (call: StringCall, s: string): string | null => {
    const vCard = new VCard()

    try {
      call(vCard, s)
    } catch (error) {
      expect(error).toBeInstanceOf(VCardException)
      expect((error as VCardException).message).toMatch(MESSAGE_STYLE)
      expect(vCard.getProperties()).toEqual([])
      return null
    }

    return vCard.toString()
  }

  it.each(entries)(
    'should escape or reject line breaks in %s()',
    (_, { strings }) => {
      for (const call of strings) {
        // The other values are valid, so a throw below comes from `s`
        expect(() => call(new VCard(), '')).not.toThrow()

        for (const lineBreak of ['\r', '\n', '\r\n']) {
          const output = outputOrReject(call, `a${lineBreak}X-INJECTED:1`)
          if (output === null) continue

          expect(output.replace(/\r\n/g, '')).not.toMatch(/[\r\n]/)
        }
      }
    },
  )

  it.each(
    entries.flatMap(([method, methodCases]) =>
      ['\x01', '\x7F'].map((char) => [char, method, methodCases] as const),
    ),
  )('should reject control character %j in %s()', (char, _, { strings }) => {
    for (const call of strings) {
      const vCard = new VCard()

      expectStyledThrow(() => call(vCard, `a${char}b`))
      expect(vCard.getProperties()).toEqual([])
    }
  })

  it.each(
    entries.flatMap(([method, methodCases]) =>
      ['\x0B', '\x0C', '\x85', '\u{2028}', '\u{2029}'].map(
        (char) => [method, char, methodCases] as const,
      ),
    ),
  )(
    'should reject or escape a line separator in %s(): %j',
    (_, char, { strings, text }) => {
      for (const call of strings) {
        const output = outputOrReject(call, `a${char}b`)
        if (output === null) continue

        // Only text values may escape the character
        expect(text).toBe(true)

        const unfolded = output.replace(/\r\n /g, '')
        expect(unfolded).toContain('a\\nb')
        expect(unfolded).not.toContain(char)
      }
    },
  )
})

describe('double quotes in parameter values', () => {
  const methods: [string, (c: VCard, t: string) => VCard][] = [
    [
      'addEmail',
      (c, t) =>
        c.addEmail({ address: 'a@example.com', type: [t as EmailType] }),
    ],
    [
      'addPhoneNumber',
      (c, t) =>
        c.addPhoneNumber({ number: '1', type: [t as unknown as 'cell'] }),
    ],
    [
      'addUrl',
      (c, t) =>
        c.addUrl({ url: 'https://a.example', type: [t as unknown as 'work'] }),
    ],
    ['addAddress', (c, t) => c.addAddress({ type: [t as unknown as 'work'] })],
    [
      'addLabel',
      (c, t) => c.addLabel({ label: 'x', type: [t as unknown as 'work'] }),
    ],
    ['addSocial', (c, t) => c.addSocial({ url: 'u', type: t })],
    ['addSocial', (c, t) => c.addSocial({ url: 'u', type: 'X', user: t })],
    [
      'addImpp',
      (c, t) => c.addImpp({ uri: 'xmpp:a@example.com', serviceType: t }),
    ],
    ['addKey', (c, t) => c.addKey({ key: 'AAAA', mime: t })],
    ['addKey', (c, t) => c.addKey({ text: 'abc', mime: t })],
  ]

  it.each(methods)(
    'should throw and store nothing on a double quote in %s() in row %#',
    (_, add) => {
      const vCard = new VCard()
      expectStyledThrow(() => add(vCard, 'a"b'))
      expect(vCard.getProperties()).toEqual([])
    },
  )
})

describe('non-string input', () => {
  // `null` selects the default, as `??` treats it as missing
  const optionalMime: ValueCall[] = [
    (c, v) => c.addKey({ key: 'data', mime: v }),
    (c, v) => c.addKey({ text: 'abc', mime: v }),
    (c, v) => c.addLogo({ image: 'data', mime: v }),
    (c, v) => c.addPhoto({ image: 'data', mime: v }),
  ]

  const values: [string, unknown][] = [
    ['42', 42],
    ['null', null],
    ['undefined', undefined],
    ['{}', {}],
  ]

  const expectThrow = (call: ValueCall, value: unknown) => {
    const vCard = new VCard()
    expectStyledThrow(() => call(vCard, value as never))
    expect(vCard.getProperties()).toEqual([])
  }

  describe.each(values)('with %s', (_, value) => {
    it.each(entries)(
      'should throw in every required input of %s()',
      (_, { required }) => {
        for (const call of required) {
          expectThrow(call, value)
        }
      },
    )

    it.each(entries.filter(([, { optional }]) => optional))(
      'should throw in every optional input of %s()',
      (_, { optional = [] }) => {
        // Left-out inputs are tested below
        if (value === undefined) {
          return
        }

        for (const call of optional) {
          expectThrow(call, value)
        }
      },
    )
  })

  // `undefined` selects the `{}` default of these methods
  const optionalOptions = new Set(['addAddress', 'addName'])

  describe.each([
    ['undefined', undefined],
    ['null', null],
    ["'x'", 'x'],
    ['[]', []],
  ])('with %s as the options argument', (_, value) => {
    it.each(
      entries.flatMap(([name, { options }]) =>
        options ? [[name, options] as const] : [],
      ),
    )('should throw in %s()', (name, call) => {
      if (value === undefined && optionalOptions.has(name)) {
        return
      }

      expectThrow(call, value)
    })
  })

  it('should accept no argument in addAddress() and addName()', () => {
    const vCard = new VCard()
    vCard.addAddress().addName()

    const output = vCard.toString()
    expect(output).toContain('ADR;TYPE=INTL,POSTAL,PARCEL,WORK:;;;;;;\r\n')
    expect(output).toContain('N:;;;;\r\n')
  })

  it('should name the method and the type in the options message', () => {
    expect(() => new VCard().addEmail(null as never)).toThrow(
      'addEmail() options must be an object (got null)',
    )
    expect(() => new VCard().addEmail([] as never)).toThrow(
      'addEmail() options must be an object (got array)',
    )
  })

  it.each([null, undefined, {}])(
    'should throw on a phone number that is not a string or number (%j)',
    (value) => {
      expectThrow((c, v) => c.addPhoneNumber({ number: v }), value)
    },
  )

  it.each([
    [42, 'number'],
    [{}, 'object'],
  ])('should throw on a non-string mime (%j)', (value, type) => {
    for (const call of optionalMime) {
      expectThrow(call, value)
    }

    expect(() =>
      new VCard().addKey({ key: 'data', mime: value as never }),
    ).toThrow(`Key TYPE values must be strings (got ${type})`)
  })

  it.each([
    ['addAddress', (c: VCard) => c.addAddress({ type: 'work' as never })],
    [
      'addEmail',
      (c: VCard) =>
        c.addEmail({ address: 'a@example.com', type: 'work' as never }),
    ],
    [
      'addPhoneNumber',
      (c: VCard) => c.addPhoneNumber({ number: '1', type: 'work' as never }),
    ],
    ['addUrl', (c: VCard) => c.addUrl({ url, type: 'work' as never })],
    [
      'addLabel',
      (c: VCard) => c.addLabel({ label: 'Street 1', type: 'work' as never }),
    ],
  ])('should throw on a non-array type in %s()', (_, call) => {
    expect(() => call(new VCard())).toThrow(VCardException)
  })

  it('should throw on type: null', () => {
    expect(() =>
      new VCard().addEmail({ address: 'a@example.com', type: null as never }),
    ).toThrow('Email TYPE values must be an array (got null)')
  })

  it('should throw on categories that are not an array', () => {
    expect(() => new VCard().addCategories('Work' as never)).toThrow(
      'Categories values must be an array (got string)',
    )
  })

  it('should throw on an invalid Date', () => {
    expect(() => new VCard().addBirthday(new Date('x'))).toThrow(VCardException)
    expect(() => new VCard().addRevision(new Date('x'))).toThrow(VCardException)
  })

  it('should accept a Date from another realm', () => {
    const date = runInNewContext('new Date(0)') as Date
    const output = new VCard().addBirthday(date).addRevision(date).toString()
    expect(output).toContain('BDAY:1970-01-01\r\n')
    expect(output).toContain('REV:1970-01-01T00:00:00Z\r\n')
  })

  it.each([
    ['addBirthday', (c: VCard, v: Date) => c.addBirthday(v)],
    ['addRevision', (c: VCard, v: Date) => c.addRevision(v)],
  ])('should throw on a fake Date in %s()', (_, call) => {
    const fake = { [Symbol.toStringTag]: 'Date' } as unknown as Date
    expect(() => call(new VCard(), fake)).toThrow(VCardException)
  })

  it('should ignore Date method overrides', () => {
    const date = new Date(0)
    date.toISOString = () => 'x\r\nEVIL:1'
    date.getUTCFullYear = () => 2000
    const output = new VCard().addBirthday(date).addRevision(date).toString()
    expect(output).toContain('BDAY:1970-01-01\r\n')
    expect(output).toContain('REV:1970-01-01T00:00:00Z\r\n')
    expect(output).not.toContain('EVIL')
  })

  it('should accept a Date without a prototype', () => {
    const date = Object.setPrototypeOf(new Date(0), null) as Date
    expect(new VCard().addRevision(date).toString()).toContain(
      'REV:1970-01-01T00:00:00Z\r\n',
    )
  })

  it('should throw on a date string in addRevision()', () => {
    expect(() => new VCard().addRevision('2024-01-01' as never)).toThrow(
      'Revision values must be Dates (got string)',
    )
  })

  it('should throw on a URL object in addUrl()', () => {
    expect(() => new VCard().addUrl({ url: new URL(url) as never })).toThrow(
      VCardException,
    )
  })

  it('should throw on an object that converts to a UTC offset', () => {
    expect(() =>
      new VCard().addTimezone({ toString: () => '+01:00' } as never),
    ).toThrow('Timezone values must be strings (got object)')
  })

  it('should name the method input in the message', () => {
    expect(() => new VCard().addNote(42 as never)).toThrow(
      'Note values must be strings (got number)',
    )
    expect(() => new VCard().addPhoneNumber({ number: null as never })).toThrow(
      'Phone number values must be strings or numbers (got null)',
    )
  })

  it('should name an array as an array', () => {
    expect(() => new VCard().addNote([] as never)).toThrow(
      'Note values must be strings (got array)',
    )
  })

  it('should show at most 64 characters and the length of a long image', () => {
    const image = `${'A'.repeat(9_999)}!`
    expect(() => new VCard().addPhoto({ image })).toThrow(
      `Photo values must be base64 (got "${'A'.repeat(64)}"... (length 10000))`,
    )
  })

  it('should throw in setCharset()', () => {
    expect(() => new VCard().setCharset(42 as never)).toThrow(VCardException)
  })

  it('should throw at build time on a non-string charset field', () => {
    const vCard = new VCard()
    vCard.charset = 42 as never

    expect(() => vCard.toString()).toThrow(VCardException)
  })

  it('should throw in setFilename() on a truthy non-string', () => {
    expect(() => new VCard().setFilename(42 as never)).toThrow(VCardException)
  })

  it('should ignore a falsy value in setFilename()', () => {
    const vCard = new VCard()
    vCard.setFilename(null as never)

    expect(vCard.getFilename()).toBe('vcard')
  })

  it('should keep the defaults of left-out optional inputs', () => {
    const vCard = new VCard()
    vCard
      .addName({ givenName: 'Jo' })
      .addAddress({ street: 'Main St' })
      .addCompany({ name: 'Acme' })
      .addImpp({ uri: 'xmpp:a@example.com' })
      .addSocial({ url, type: 'x' })
      .addCustomProperty({ name: 'X-A', value: 'v' })
      .addKey({ key: 'data', mime: undefined })
      .addKey({ text: 'abc', mime: undefined })

    const output = vCard.toString()
    expect(output).toContain('N:;Jo;;;\r\n')
    expect(output).toContain('FN:Jo\r\n')
    expect(output).toContain(
      'ADR;TYPE=INTL,POSTAL,PARCEL,WORK:;;Main St;;;;\r\n',
    )
    expect(output).toContain('ORG:Acme\r\n')
    expect(output).toContain('IMPP:xmpp:a@example.com\r\n')
    expect(output).toContain(`X-SOCIALPROFILE;type=x:${url}\r\n`)
    expect(output).toContain('X-A:v\r\n')
    expect(output).toContain('KEY;ENCODING=b;TYPE=PGP:data\r\n')
    expect(output).toContain('KEY;VALUE=text;TYPE=PGP:abc\r\n')
    expect(output).not.toMatch(/undefined|null/)
  })
})

describe('addKey() forms', () => {
  // The type rejects more than 1 form. At runtime, `url` wins, then `text`.
  it('should reject more than 1 key form in the type', () => {
    const output = new VCard()
      // @ts-expect-error: key and text
      .addKey({ key: 'AAAA', text: 'a' })
      // @ts-expect-error: key and url
      .addKey({ key: 'AAAA', url: `${url}/b` })
      // @ts-expect-error: text and url
      .addKey({ text: 'c', url: `${url}/c` })
      // @ts-expect-error: key, text and url
      .addKey({ key: 'AAAA', text: 'd', url: `${url}/d` })
      .toString()

    expect(output).toContain('KEY;VALUE=text;TYPE=PGP:a\r\n')
    expect(output).toContain(`KEY;VALUE=uri:${url}/b\r\n`)
    expect(output).toContain(`KEY;VALUE=uri:${url}/c\r\n`)
    expect(output).toContain(`KEY;VALUE=uri:${url}/d\r\n`)
    expect(output).not.toContain('ENCODING=b')
  })
})

describe.each(['addPhoto', 'addLogo'] as const)('%s() forms', (method) => {
  const name = method === 'addPhoto' ? 'PHOTO' : 'LOGO'

  // The type rejects more than 1 form. At runtime, `url` wins.
  it('should reject more than 1 form in the type', () => {
    const vCard = new VCard()
    // @ts-expect-error: url and image
    vCard[method]({ url: `${url}/a`, image: 'AAAA' })
    // @ts-expect-error: url and mime
    vCard[method]({ url: `${url}/b`, mime: 'png' })
    // @ts-expect-error: url, image and mime
    vCard[method]({ url: `${url}/c`, image: 'AAAA', mime: 'png' })
    const output = vCard.toString()

    expect(output).toContain(`${name};VALUE=uri:${url}/a\r\n`)
    expect(output).toContain(`${name};VALUE=uri:${url}/b\r\n`)
    expect(output).toContain(`${name};VALUE=uri:${url}/c\r\n`)
    expect(output).not.toContain('ENCODING=b')
  })
})
