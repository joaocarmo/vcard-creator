import { readFileSync } from 'node:fs'
import { vi } from 'vitest'
import VCard from './VCard'
import VCardException from './VCardException'
import type { DateString, SocialOptions } from './types/VCard'

// Each row: the method, a call on a fresh card and 1 content line it writes.
// The rows check the property name, the parameters and the value type. The
// value-type rules are tested in values.test.ts and format.test.ts.
const mappings: [string, (c: VCard) => unknown, string][] = [
  ['addFullName', (c) => c.addFullName('Madonna'), 'FN:Madonna'],
  [
    'addName',
    (c) =>
      c.addName({
        givenName: 'John',
        familyName: 'Doe',
        honorificPrefix: 'Dr.',
      }),
    'N:Doe;John;;Dr.;',
  ],
  ['addNickname', (c) => c.addNickname('Johnny'), 'NICKNAME:Johnny'],
  [
    'addNickname',
    (c) => c.addNickname(['Nick,name', 'Other']),
    'NICKNAME:Nick\\,name,Other',
  ],
  ['addBirthday', (c) => c.addBirthday('1990-05-15'), 'BDAY:1990-05-15'],
  [
    'addBirthday',
    (c) => c.addBirthday(new Date('1990-05-15T00:00:00Z')),
    'BDAY:1990-05-15',
  ],
  [
    'addCompany',
    (c) => c.addCompany({ name: 'Acme; Corp', department: 'Engineering' }),
    'ORG:Acme\\; Corp;Engineering',
  ],
  ['addJobtitle', (c) => c.addJobtitle('Web Developer'), 'TITLE:Web Developer'],
  ['addRole', (c) => c.addRole('Engineer'), 'ROLE:Engineer'],
  [
    'addEmail',
    (c) => c.addEmail({ address: 'john@example.com', type: ['pref', 'work'] }),
    'EMAIL;TYPE=PREF,WORK:john@example.com',
  ],
  [
    'addEmail',
    (c) => c.addEmail({ address: '"a,b"@x.y' }),
    'EMAIL:"a\\,b"@x.y',
  ],
  [
    'addPhoneNumber',
    (c) => c.addPhoneNumber({ number: '+1-555-0100', type: ['cell'] }),
    'TEL;TYPE=CELL:+1-555-0100',
  ],
  [
    'addUrl',
    (c) => c.addUrl({ url: 'https://example.com/a;b?c=1,2', type: ['work'] }),
    'URL;TYPE=WORK:https://example.com/a;b?c=1,2',
  ],
  [
    'addAddress',
    (c) =>
      c.addAddress({
        street: '123 Main; Suite 5',
        locality: 'Springfield',
        region: 'IL',
        postalCode: '62701',
        country: 'USA',
        type: ['home', 'postal'],
      }),
    'ADR;TYPE=HOME,POSTAL:;;123 Main\\; Suite 5;Springfield;IL;62701;USA',
  ],
  [
    'addAddress',
    (c) => c.addAddress({ street: '123 Main St' }),
    'ADR;TYPE=INTL,POSTAL,PARCEL,WORK:;;123 Main St;;;;',
  ],
  [
    'addAddress',
    (c) => c.addAddress({ street: 'Main St', type: [] }),
    'ADR:;;Main St;;;;',
  ],
  [
    'addLabel',
    (c) => c.addLabel({ label: 'Line 1\nLine 2' }),
    'LABEL;TYPE=INTL,POSTAL,PARCEL,WORK:Line 1\\nLine 2',
  ],
  [
    'addLabel',
    (c) => c.addLabel({ label: 'Home address', type: ['home'] }),
    'LABEL;TYPE=HOME:Home address',
  ],
  [
    'addLabel',
    (c) => c.addLabel({ label: 'Home address', type: [] }),
    'LABEL:Home address',
  ],
  [
    'addSocial',
    (c) => c.addSocial({ url: 'https://x.com/jdoe', type: 'X', user: 'jdoe' }),
    'X-SOCIALPROFILE;type=X;x-user=jdoe:https://x.com/jdoe',
  ],
  [
    'addImpp',
    (c) => c.addImpp({ uri: 'xmpp:user@example.com', serviceType: 'XMPP' }),
    'IMPP;X-SERVICE-TYPE=XMPP:xmpp:user@example.com',
  ],
  [
    'addImpp',
    (c) => c.addImpp({ uri: 'sip:user@example.com' }),
    'IMPP:sip:user@example.com',
  ],
  [
    'addGeo',
    (c) => c.addGeo({ latitude: 37.386013, longitude: -122.082932 }),
    'GEO:37.386013;-122.082932',
  ],
  ['addTimezone', (c) => c.addTimezone('+01:00'), 'TZ:+01:00'],
  [
    'addTimezone',
    (c) => c.addTimezone('-05:00; EST, Raleigh'),
    'TZ;VALUE=text:-05:00\\; EST\\, Raleigh',
  ],
  [
    'addPhoto',
    (c) => c.addPhoto({ url: 'https://example.com/a;b?c=1,2' }),
    'PHOTO;VALUE=uri:https://example.com/a;b?c=1,2',
  ],
  [
    'addPhoto',
    (c) => c.addPhoto({ image: 'base64data==', mime: 'png' }),
    'PHOTO;ENCODING=b;TYPE=PNG:base64data==',
  ],
  [
    'addLogo',
    (c) => c.addLogo({ url: 'https://example.com/logo.png' }),
    'LOGO;VALUE=uri:https://example.com/logo.png',
  ],
  [
    'addLogo',
    (c) => c.addLogo({ image: 'base64data==' }),
    'LOGO;ENCODING=b;TYPE=JPEG:base64data==',
  ],
  [
    'addKey',
    (c) => c.addKey({ url: 'https://example.com/key.pub' }),
    'KEY;VALUE=uri:https://example.com/key.pub',
  ],
  [
    'addKey',
    (c) => c.addKey({ key: 'MIICajCCAdOgAwIBAgICBEUwDQ==' }),
    'KEY;ENCODING=b;TYPE=PGP:MIICajCCAdOgAwIBAgICBEUwDQ==',
  ],
  [
    'addKey',
    (c) => c.addKey({ key: 'base64cert==', mime: 'x509' }),
    'KEY;ENCODING=b;TYPE=X509:base64cert==',
  ],
  [
    'addKey',
    (c) => c.addKey({ key: 'AAAA', mime: 'PGP;X=1' }),
    'KEY;ENCODING=b;TYPE="PGP;X=1":AAAA',
  ],
  ['addUid', (c) => c.addUid('u;1,2\\x'), 'UID:u\\;1\\,2\\\\x'],
  [
    'addCategories',
    (c) => c.addCategories(['Rock, Pop', 'Jazz']),
    'CATEGORIES:Rock\\, Pop,Jazz',
  ],
  [
    'addNote',
    (c) => c.addNote('Call me; available, Mon\\Fri\nLeave message'),
    'NOTE:Call me\\; available\\, Mon\\\\Fri\\nLeave message',
  ],
  ['addSortString', (c) => c.addSortString('やまだ'), 'SORT-STRING:やまだ'],
  [
    'addRevision',
    (c) => c.addRevision(new Date('2024-01-15T10:30:00Z')),
    'REV:2024-01-15T10:30:00.000Z',
  ],
  [
    'addCustomProperty',
    (c) =>
      c.addCustomProperty({
        name: 'x-custom-field',
        value: 'a;b,c\\d',
        params: 'TYPE=work',
      }),
    'X-CUSTOM-FIELD;TYPE=work:a;b,c\\d',
  ],
  [
    'addCustomProperty',
    (c) =>
      c.addCustomProperty({
        name: 'X-TEST',
        value: 'a\tb',
        params: 'X-P="c\td"',
      }),
    'X-TEST;X-P="c\td":a\tb',
  ],
  [
    'addCustomProperty',
    (c) => c.addCustomProperty({ name: 'X-TEST', value: '', params: '' }),
    'X-TEST:',
  ],
]

describe('property mapping', () => {
  it('should cover every public add*() method', () => {
    const methods = Object.getOwnPropertyNames(VCard.prototype).filter((name) =>
      name.startsWith('add'),
    )

    expect([...new Set(mappings.map(([method]) => method))].sort()).toEqual(
      methods.sort(),
    )
  })

  it.each(mappings)('%s() should write %#', (_, add, line) => {
    const vCard = new VCard()
    add(vCard)
    expect(vCard.toString()).toContain(`\r\n${line}\r\n`)
  })
})

describe('addFullName()', () => {
  it('should override auto-generated FN when called before addName', () => {
    const vCard = new VCard()
    vCard.addFullName('The Company').addName({ familyName: 'Inc' })
    const output = vCard.toString()
    expect(output).toContain('FN:The Company')
    expect(output).not.toContain('FN:Inc')
  })

  it('should throw when addName already set FN', () => {
    const vCard = new VCard()
    vCard.addName({ givenName: 'John', familyName: 'Doe' })
    expect(() => vCard.addFullName('Custom')).toThrow(VCardException)
  })

  it('should prevent duplicate FN with non-default charset (addFullName first)', () => {
    const vCard = new VCard()
    vCard.setCharset('iso-8859-1')
    vCard.addFullName('Custom Name')
    vCard.addName({ givenName: 'John', familyName: 'Doe' })
    const output = vCard.toString()
    expect(output.match(/FN/g)).toHaveLength(1)
    expect(output).toContain('FN;CHARSET=iso-8859-1:Custom Name')
  })

  it('should throw on addFullName when addName already set FN with non-default charset', () => {
    const vCard = new VCard()
    vCard.setCharset('iso-8859-1')
    vCard.addName({ givenName: 'John', familyName: 'Doe' })
    expect(() => vCard.addFullName('Custom')).toThrow(VCardException)
  })
})

describe('addName()', () => {
  it('should generate FN from the name components', () => {
    const vCard = new VCard()
    vCard.addName({
      givenName: 'John',
      familyName: 'Doe',
      honorificPrefix: 'Dr.',
    })
    expect(vCard.toString()).toContain('\r\nFN:Dr. John Doe\r\n')
  })

  it('should escape the generated FN', () => {
    const vCard = new VCard()
    vCard.addName({ familyName: 'Smith, Jr.', givenName: 'John' })
    const output = vCard.toString()
    expect(output).toContain('N:Smith\\, Jr.;John;;;')
    expect(output).toContain('FN:John Smith\\, Jr.')
  })

  it('should not generate FN when all name components are empty', () => {
    const vCard = new VCard()
    vCard.addName({})
    const output = vCard.toString()
    expect(output).toContain('N:;;;;')
    expect(output).not.toContain('FN:')
  })

  it('should not generate FN when a custom FN property exists', () => {
    const vCard = new VCard()
    vCard.addCustomProperty({ name: 'fn', value: 'Custom' })
    vCard.addName({ givenName: 'John' })
    const fnLines = vCard
      .toString()
      .split('\r\n')
      .filter((line) => line.startsWith('FN'))
    expect(fnLines).toEqual(['FN:Custom'])
  })
})

describe('addBirthday()', () => {
  it('should throw and store nothing on an invalid date string', () => {
    const vCard = new VCard()
    expect(() => vCard.addBirthday('1990-02-30' as DateString)).toThrow(
      'Invalid birthday: must be an RFC 2425 date or date-time, such as 1990-05-15 (got "1990-02-30")',
    )
    expect(vCard.getProperties()).toEqual([])
  })
})

describe('addPhoneNumber()', () => {
  it.each([
    [1234567890, 'TEL:1234567890'],
    [0, 'TEL:0'],
    [-1, 'TEL:-1'],
  ])('should accept the finite number %s', (number, expected) => {
    const vCard = new VCard()
    vCard.addPhoneNumber({ number })
    expect(vCard.toString()).toContain(`\r\n${expected}\r\n`)
  })

  it.each([NaN, Infinity, -Infinity])(
    'should throw and store nothing on number %s',
    (number) => {
      const vCard = new VCard()
      expect(() => vCard.addPhoneNumber({ number })).toThrow(
        `Phone number values must be finite numbers (got ${number})`,
      )
      expect(vCard.getProperties()).toEqual([])
    },
  )
})

describe('addSocial()', () => {
  it('should output both X-SOCIALPROFILE and IMPP', () => {
    const vCard = new VCard()
    vCard.addSocial({ url: 'https://linkedin.com/in/jdoe', type: 'LinkedIn' })

    const output = vCard.toString()
    expect(output).toContain(
      'X-SOCIALPROFILE;type=LinkedIn:https://linkedin.com/in/jdoe',
    )
    expect(output).toContain(
      'IMPP;X-SERVICE-TYPE=LinkedIn:https://linkedin.com/in/jdoe',
    )
  })

  it('should throw VCardException when type is missing', () => {
    const vCard = new VCard()
    expect(() =>
      vCard.addSocial({ url: 'https://x.com/jdoe' } as SocialOptions),
    ).toThrow(VCardException)
    expect(vCard.toString()).not.toContain('X-SOCIALPROFILE')
  })

  it('should handle empty type and no user', () => {
    const vCard = new VCard()
    vCard.addSocial({ url: 'https://example.com/profile', type: '' })

    const output = vCard.toString()
    expect(output).toContain('X-SOCIALPROFILE:https://example.com/profile')
    expect(output).toContain('IMPP:https://example.com/profile')
    expect(output).not.toContain('X-SERVICE-TYPE')
    expect(output).not.toContain('x-user')
  })

  it('should quote a type with a semicolon in both properties', () => {
    const vCard = new VCard()
    vCard.addSocial({ url: 'u', type: 'My Site;x', user: 'a,b' })

    const output = vCard.toString()
    expect(output).toContain('X-SOCIALPROFILE;type="My Site;x";x-user="a,b":u')
    expect(output).toContain('IMPP;X-SERVICE-TYPE="My Site;x":u')
  })

  it.each([
    ['type', { url: 'u', type: 'a"b' }],
    ['user', { url: 'u', type: 'X', user: 'a"b' }],
  ])('should store nothing when %s has a double quote', (_, options) => {
    const vCard = new VCard()
    expect(() => vCard.addSocial(options)).toThrow(VCardException)
    expect(vCard.getProperties()).toEqual([])
  })
})

describe('addGeo()', () => {
  it('should throw and store nothing on an out-of-range latitude', () => {
    const vCard = new VCard()
    expect(() => vCard.addGeo({ latitude: 91, longitude: 0 })).toThrow(
      'Invalid latitude: 91. Must be between -90 and 90.',
    )
    expect(vCard.getProperties()).toEqual([])
  })
})

describe('addTimezone()', () => {
  it('should throw and store nothing on an out-of-range offset', () => {
    const vCard = new VCard()
    expect(() => vCard.addTimezone('+24:00')).toThrow(VCardException)
    expect(vCard.getProperties()).toEqual([])
  })

  it('should accept a valid offset after rejecting an invalid one', () => {
    const vCard = new VCard()
    expect(() => vCard.addTimezone('+24:00')).toThrow(VCardException)
    vCard.addTimezone('+01:00')
    expect(vCard.toString()).toContain('\r\nTZ:+01:00\r\n')
  })
})

describe('addRevision()', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-01T00:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should write the custom revision only', () => {
    const vCard = new VCard()
    vCard.addRevision(new Date('2024-01-15T10:30:00Z'))
    expect(vCard.toString().match(/REV:/g)).toHaveLength(1)
  })

  it('should auto-generate REV when addRevision not called', () => {
    const vCard = new VCard()
    vCard.addName({ givenName: 'John' })
    expect(vCard.toString()).toContain('REV:2026-01-01T00:00:00.000Z')
  })

  it('should throw and store nothing on a Date in year 10000', () => {
    const vCard = new VCard()
    expect(() =>
      vCard.addRevision(new Date('+010000-01-01T00:00:00Z')),
    ).toThrow('Invalid revision: the year must be 0000 to 9999 (got 10000)')
    expect(vCard.getProperties()).toEqual([])
  })
})

describe.each([
  [
    'addPhoto',
    'PHOTO',
    (c: VCard) => c.addPhoto({ image: 'AAAA' }),
    (c: VCard) => c.addPhoto({ url: 'https://example.com/a' }),
  ],
  [
    'addLogo',
    'LOGO',
    (c: VCard) => c.addLogo({ image: 'AAAA' }),
    (c: VCard) => c.addLogo({ url: 'https://example.com/a' }),
  ],
  [
    'addKey',
    'KEY',
    (c: VCard) => c.addKey({ key: 'AAAA' }),
    (c: VCard) => c.addKey({ url: 'https://example.com/a' }),
  ],
] as const)('%s() URL and base64', (_, property, addImage, addUrl) => {
  it('should allow both on the same card', () => {
    const vCard = new VCard()
    addImage(vCard)
    addUrl(vCard)

    const output = vCard.toString()
    expect(output).toContain(`\r\n${property};ENCODING=b;`)
    expect(output).toContain(`\r\n${property};VALUE=uri:https://example.com/a`)
  })
})

describe.each([
  [
    'addPhoto',
    'PHOTO',
    'Image',
    (c: VCard, v: string) => c.addPhoto({ image: v }),
  ],
  [
    'addLogo',
    'LOGO',
    'Image',
    (c: VCard, v: string) => c.addLogo({ image: v }),
  ],
  ['addKey', 'KEY', 'Key', (c: VCard, v: string) => c.addKey({ key: v })],
] as const)('%s() base64 value', (_, property, label, add) => {
  // Unfolds the card and returns the line of the property
  const lineOf = (vCard: VCard) =>
    vCard
      .toString()
      .replace(/\r\n /g, '')
      .split('\r\n')
      .find((line) => line.startsWith(`${property};`))

  it('should throw and store nothing on a value that is not base64', () => {
    const vCard = new VCard()
    expect(() => add(vCard, 'not base64!!')).toThrow(
      `${label} values must be base64 (got "not base64!!")`,
    )
    expect(vCard.getProperties()).toEqual([])
  })

  it('should write the sample image plain and wrapped as the same line', () => {
    const image = readFileSync(
      new URL('../test/fixtures/sample.jpg', import.meta.url),
      'base64',
    )
    const wrapped = image.replace(/.{76}/g, '$&\n')

    const plain = new VCard()
    add(plain, image)
    const fromWrapped = new VCard()
    add(fromWrapped, wrapped)

    expect(wrapped).toContain('\n')
    expect(lineOf(plain)?.endsWith(`:${image}`)).toBe(true)
    expect(lineOf(fromWrapped)).toBe(lineOf(plain))
  })
})

describe.each(['addPhoto', 'addLogo'] as const)('%s() MIME type', (method) => {
  it('should throw and store nothing on an invalid MIME type', () => {
    const vCard = new VCard()
    expect(() => vCard[method]({ image: 'data', mime: 'foobar' })).toThrow(
      'The MIME Media Type is invalid (foobar)',
    )
    expect(vCard.getProperties()).toEqual([])
  })
})

describe('addKey()', () => {
  it('should throw and store nothing on a double quote in mime', () => {
    const vCard = new VCard()
    expect(() => vCard.addKey({ key: 'AAAA', mime: 'a"b' })).toThrow(
      VCardException,
    )
    expect(vCard.getProperties()).toEqual([])
  })
})

describe('addCustomProperty()', () => {
  it('should throw and store nothing on an invalid name', () => {
    const vCard = new VCard()
    expect(() => vCard.addCustomProperty({ name: 'X:A', value: 'a' })).toThrow(
      VCardException,
    )
    expect(vCard.getProperties()).toEqual([])
  })

  const reservedNames = ['BEGIN', 'END', 'VERSION', 'PRODID', 'REV']

  it.each([
    ...reservedNames,
    ...reservedNames.map((n) => n.toLowerCase()),
    'Version',
  ])('should throw and store nothing on reserved name %j', (name) => {
    const vCard = new VCard()
    expect(() => vCard.addCustomProperty({ name, value: 'a' })).toThrow(
      VCardException,
    )
    expect(vCard.getProperties()).toEqual([])
  })

  it.each(reservedNames)(
    'should throw and store nothing on reserved name %j with a group',
    (name) => {
      const vCard = new VCard()
      expect(() =>
        vCard.addCustomProperty({ name, value: 'a', group: 'item1' }),
      ).toThrow(VCardException)
      expect(vCard.getProperties()).toEqual([])
    },
  )

  it.each(['REV', 'rev'])('should point %j to addRevision()', (name) => {
    expect(() =>
      new VCard().addCustomProperty({ name, value: '2024-01-01' }),
    ).toThrow('addRevision()')
  })

  it.each(['X-END', 'ENDX', 'X-REV', 'REVISION'])(
    'should accept name %j',
    (name) => {
      const vCard = new VCard()
      vCard.addCustomProperty({ name, value: 'a' })
      expect(vCard.toString()).toContain(`\r\n${name}:a\r\n`)
    },
  )
})
