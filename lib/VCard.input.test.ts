import VCard from './VCard'
import VCardException from './VCardException'
import type {
  AddressType,
  DateString,
  EmailType,
  PhoneType,
  UrlType,
} from './types/VCard'
import { addMethods } from '../test/helpers'

describe('line breaks in every string input', () => {
  type Call = (card: VCard, s: string) => unknown

  // Runs `call` on a fresh card. Returns the output, or null when the call
  // threw a VCardException and stored nothing.
  const outputOrReject = (call: Call, s: string): string | null => {
    const vCard = new VCard()

    try {
      call(vCard, s)
    } catch (error) {
      expect(error).toBeInstanceOf(VCardException)
      expect(vCard.getProperties()).toEqual([])
      return null
    }

    return vCard.toString()
  }

  // Each call appends `s` to 1 string value and keeps the others valid
  const calls: Record<string, Call[]> = {
    addAddress: [
      (c, s) => c.addAddress({ postOfficeBox: s }),
      (c, s) => c.addAddress({ extended: s }),
      (c, s) => c.addAddress({ street: s }),
      (c, s) => c.addAddress({ locality: s }),
      (c, s) => c.addAddress({ region: s }),
      (c, s) => c.addAddress({ postalCode: s }),
      (c, s) => c.addAddress({ country: s }),
      (c, s) => c.addAddress({ type: [`home${s}` as AddressType] }),
    ],
    addBirthday: [(c, s) => c.addBirthday(`1990-05-15${s}` as DateString)],
    addCompany: [
      (c, s) => c.addCompany({ name: `Acme${s}` }),
      (c, s) => c.addCompany({ name: 'Acme', department: `Dev${s}` }),
    ],
    addEmail: [
      (c, s) => c.addEmail({ address: `a@example.com${s}` }),
      (c, s) =>
        c.addEmail({
          address: 'a@example.com',
          type: [`work${s}` as EmailType],
        }),
    ],
    addKey: [
      (c, s) => c.addKey({ url: `https://example.com/k${s}` }),
      (c, s) => c.addKey({ key: `data${s}` }),
      (c, s) => c.addKey({ key: 'data', mime: `PGP${s}` }),
    ],
    addJobtitle: [(c, s) => c.addJobtitle(s)],
    addRole: [(c, s) => c.addRole(s)],
    addFullName: [(c, s) => c.addFullName(s)],
    addName: [
      (c, s) => c.addName({ familyName: s }),
      (c, s) => c.addName({ givenName: s }),
      (c, s) => c.addName({ additionalNames: s }),
      (c, s) => c.addName({ honorificPrefix: s }),
      (c, s) => c.addName({ honorificSuffix: s }),
    ],
    addNickname: [
      (c, s) => c.addNickname(s),
      (c, s) => c.addNickname(['Jo', s]),
    ],
    addNote: [(c, s) => c.addNote(s)],
    addCategories: [(c, s) => c.addCategories(['Work', s])],
    addPhoneNumber: [
      (c, s) => c.addPhoneNumber({ number: `+1-555-0100${s}` }),
      (c, s) =>
        c.addPhoneNumber({
          number: '+1-555-0100',
          type: [`cell${s}` as PhoneType],
        }),
    ],
    addLogo: [
      (c, s) => c.addLogo({ url: `https://example.com/l${s}` }),
      (c, s) => c.addLogo({ image: `data${s}` }),
      (c, s) => c.addLogo({ image: 'data', mime: `png${s}` }),
    ],
    addPhoto: [
      (c, s) => c.addPhoto({ url: `https://example.com/p${s}` }),
      (c, s) => c.addPhoto({ image: `data${s}` }),
      (c, s) => c.addPhoto({ image: 'data', mime: `png${s}` }),
    ],
    addUrl: [
      (c, s) => c.addUrl({ url: `https://example.com/${s}` }),
      (c, s) =>
        c.addUrl({
          url: 'https://example.com',
          type: [`work${s}` as UrlType],
        }),
    ],
    addSocial: [
      (c, s) => c.addSocial({ url: `https://example.com/${s}`, type: 'x' }),
      (c, s) => c.addSocial({ url: 'https://example.com', type: `x${s}` }),
      (c, s) =>
        c.addSocial({ url: 'https://example.com', type: 'x', user: `u${s}` }),
    ],
    addImpp: [
      (c, s) => c.addImpp({ uri: `xmpp:a@example.com${s}` }),
      (c, s) =>
        c.addImpp({ uri: 'xmpp:a@example.com', serviceType: `Jabber${s}` }),
    ],
    addUid: [(c, s) => c.addUid(`uid${s}`)],
    addGeo: [],
    addTimezone: [(c, s) => c.addTimezone(`Europe/Lisbon${s}`)],
    addSortString: [(c, s) => c.addSortString(s)],
    addRevision: [],
    addLabel: [
      (c, s) => c.addLabel({ label: `Street 1${s}` }),
      (c, s) =>
        c.addLabel({ label: 'Street 1', type: [`home${s}` as AddressType] }),
    ],
    addCustomProperty: [
      (c, s) => c.addCustomProperty({ name: `X-A${s}`, value: 'v' }),
      (c, s) => c.addCustomProperty({ name: 'X-A', value: s }),
      (c, s) =>
        c.addCustomProperty({ name: 'X-A', value: 'v', params: `X-P=1${s}` }),
      (c, s) =>
        c.addCustomProperty({ name: 'X-A', value: 'v', group: `item1${s}` }),
    ],
  }

  it('should cover every public add*() method', () => {
    expect(Object.keys(calls).sort()).toEqual([...addMethods].sort())
  })

  it.each(Object.entries(calls))(
    'should escape or reject line breaks in %s()',
    (_, methodCalls) => {
      for (const call of methodCalls) {
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
    Object.entries(calls).flatMap(([method, methodCalls]) =>
      ['\x01', '\x7F'].map((char) => [char, method, methodCalls] as const),
    ),
  )('should reject control character %j in %s()', (char, _, methodCalls) => {
    for (const call of methodCalls) {
      const vCard = new VCard()

      expect(() => call(vCard, `a${char}b`)).toThrow(VCardException)
      expect(vCard.getProperties()).toEqual([])
    }
  })

  // Built-in methods that escape text values
  const textMethods = new Set([
    'addAddress',
    'addCategories',
    'addCompany',
    'addEmail',
    'addFullName',
    'addJobtitle',
    'addLabel',
    'addName',
    'addNickname',
    'addNote',
    'addRole',
    'addSortString',
    'addTimezone',
    'addUid',
  ])

  it.each(
    Object.entries(calls).flatMap(([method, methodCalls]) =>
      ['\x0B', '\x0C', '\x85', '\u{2028}', '\u{2029}'].map(
        (char) => [method, char, methodCalls] as const,
      ),
    ),
  )(
    'should reject or escape a line separator in %s(): %j',
    (method, char, methodCalls) => {
      for (const call of methodCalls) {
        const output = outputOrReject(call, `a${char}b`)
        if (output === null) continue

        // Only text values may escape the character
        expect(textMethods).toContain(method)

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
  ]

  it.each(methods)(
    '%s should throw and store nothing on a double quote',
    (_, add) => {
      const vCard = new VCard()
      expect(() => add(vCard, 'a"b')).toThrow(VCardException)
      expect(vCard.getProperties()).toEqual([])
    },
  )
})

describe('non-string input', () => {
  // `v` replaces 1 string input. The other inputs are valid.
  type Call = (card: VCard, v: never) => unknown

  const url = 'https://example.com'

  // Inputs without a default
  const required: Record<string, Call[]> = {
    addAddress: [],
    addBirthday: [(c, v) => c.addBirthday(v)],
    addCompany: [(c, v) => c.addCompany({ name: v })],
    addEmail: [(c, v) => c.addEmail({ address: v })],
    addKey: [(c, v) => c.addKey({ url: v }), (c, v) => c.addKey({ key: v })],
    addJobtitle: [(c, v) => c.addJobtitle(v)],
    addRole: [(c, v) => c.addRole(v)],
    addFullName: [(c, v) => c.addFullName(v)],
    addName: [],
    addNickname: [
      (c, v) => c.addNickname(v),
      (c, v) => c.addNickname(['Jo', v]),
    ],
    addNote: [(c, v) => c.addNote(v)],
    addCategories: [
      (c, v) => c.addCategories(v),
      (c, v) => c.addCategories(['Work', v]),
    ],
    // `number` also accepts a number, so it has its own test
    addPhoneNumber: [],
    addLogo: [
      (c, v) => c.addLogo({ url: v }),
      (c, v) => c.addLogo({ image: v }),
    ],
    addPhoto: [
      (c, v) => c.addPhoto({ url: v }),
      (c, v) => c.addPhoto({ image: v }),
    ],
    addUrl: [(c, v) => c.addUrl({ url: v })],
    addSocial: [
      (c, v) => c.addSocial({ url: v, type: 'x' }),
      (c, v) => c.addSocial({ url, type: v }),
    ],
    addImpp: [(c, v) => c.addImpp({ uri: v })],
    addUid: [(c, v) => c.addUid(v)],
    // Covered by the float-pair pipeline tests
    addGeo: [],
    addTimezone: [(c, v) => c.addTimezone(v)],
    addSortString: [(c, v) => c.addSortString(v)],
    addRevision: [(c, v) => c.addRevision(v)],
    addLabel: [(c, v) => c.addLabel({ label: v })],
    addCustomProperty: [
      (c, v) => c.addCustomProperty({ name: v, value: 'v' }),
      (c, v) => c.addCustomProperty({ name: 'X-A', value: v }),
    ],
  }

  // Inputs with a default, which `undefined` selects
  const optional: Record<string, Call[]> = {
    addAddress: [
      (c, v) => c.addAddress({ postOfficeBox: v }),
      (c, v) => c.addAddress({ extended: v }),
      (c, v) => c.addAddress({ street: v }),
      (c, v) => c.addAddress({ locality: v }),
      (c, v) => c.addAddress({ region: v }),
      (c, v) => c.addAddress({ postalCode: v }),
      (c, v) => c.addAddress({ country: v }),
    ],
    addCompany: [(c, v) => c.addCompany({ name: 'Acme', department: v })],
    addName: [
      (c, v) => c.addName({ familyName: v }),
      (c, v) => c.addName({ givenName: v }),
      (c, v) => c.addName({ additionalNames: v }),
      (c, v) => c.addName({ honorificPrefix: v }),
      (c, v) => c.addName({ honorificSuffix: v }),
    ],
    addSocial: [(c, v) => c.addSocial({ url, type: 'x', user: v })],
    addImpp: [(c, v) => c.addImpp({ uri: url, serviceType: v })],
    addCustomProperty: [
      (c, v) => c.addCustomProperty({ name: 'X-A', value: 'v', params: v }),
      (c, v) => c.addCustomProperty({ name: 'X-A', value: 'v', group: v }),
    ],
  }

  // `null` selects the default, as `??` treats it as missing
  const optionalMime: Call[] = [
    (c, v) => c.addKey({ key: 'data', mime: v }),
    (c, v) => c.addLogo({ image: 'data', mime: v }),
    (c, v) => c.addPhoto({ image: 'data', mime: v }),
  ]

  const values: [string, unknown][] = [
    ['42', 42],
    ['null', null],
    ['undefined', undefined],
    ['{}', {}],
  ]

  const expectThrow = (call: Call, value: unknown) => {
    const vCard = new VCard()
    expect(() => call(vCard, value as never)).toThrow(VCardException)
    expect(vCard.getProperties()).toEqual([])
  }

  it('should cover every public add*() method', () => {
    expect(Object.keys(required).sort()).toEqual([...addMethods].sort())
  })

  describe.each(values)('with %s', (_, value) => {
    it.each(Object.entries(required))(
      'should throw in every required input of %s()',
      (_, calls) => {
        for (const call of calls) {
          expectThrow(call, value)
        }
      },
    )

    it.each(Object.entries(optional))(
      'should throw in every optional input of %s()',
      (_, calls) => {
        // Left-out inputs are tested below
        if (value === undefined) {
          return
        }

        for (const call of calls) {
          expectThrow(call, value)
        }
      },
    )
  })

  // `v` replaces the whole options argument
  const options: Record<string, Call> = {
    addAddress: (c, v) => c.addAddress(v),
    addCompany: (c, v) => c.addCompany(v),
    addEmail: (c, v) => c.addEmail(v),
    addKey: (c, v) => c.addKey(v),
    addName: (c, v) => c.addName(v),
    addPhoneNumber: (c, v) => c.addPhoneNumber(v),
    addLogo: (c, v) => c.addLogo(v),
    addPhoto: (c, v) => c.addPhoto(v),
    addUrl: (c, v) => c.addUrl(v),
    addSocial: (c, v) => c.addSocial(v),
    addImpp: (c, v) => c.addImpp(v),
    addGeo: (c, v) => c.addGeo(v),
    addLabel: (c, v) => c.addLabel(v),
    addCustomProperty: (c, v) => c.addCustomProperty(v),
  }

  // Methods that take a string, not an options object
  const stringArgMethods = new Set([
    'addBirthday',
    'addCategories',
    'addFullName',
    'addJobtitle',
    'addNickname',
    'addNote',
    'addRevision',
    'addRole',
    'addSortString',
    'addTimezone',
    'addUid',
  ])

  it('should cover every add*() method that takes options', () => {
    expect(Object.keys(options).sort()).toEqual(
      addMethods.filter((name) => !stringArgMethods.has(name)).sort(),
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
    it.each(Object.entries(options))('should throw in %s()', (name, call) => {
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

  it.each([42, {}])('should throw on a non-string mime (%j)', (value) => {
    for (const call of optionalMime) {
      expectThrow(call, value)
    }
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
    ).toThrow('Type values must be an array (got null)')
  })

  it('should throw on an invalid Date', () => {
    expect(() => new VCard().addBirthday(new Date('x'))).toThrow(VCardException)
    expect(() => new VCard().addRevision(new Date('x'))).toThrow(VCardException)
  })

  it('should throw on a date string in addRevision()', () => {
    expect(() => new VCard().addRevision('2024-01-01' as never)).toThrow(
      'Invalid revision: must be a Date (got string)',
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
      'Text values must be strings (got number)',
    )
    expect(() => new VCard().addPhoneNumber({ number: null as never })).toThrow(
      'Phone number values must be strings or numbers (got null)',
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
    expect(output).not.toMatch(/undefined|null/)
  })
})
