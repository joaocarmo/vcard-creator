import VCard from './VCard'
import VCardException from './VCardException'
import type { SocialOptions } from './types/VCard'
import { sampleImage } from '../test/fixtures'
import { addMethods, freezeTime } from '../test/helpers'

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
  ['addNickname', (c) => c.addNickname([' Jo']), 'NICKNAME: Jo'],
  ['addBirthday', (c) => c.addBirthday('1990-05-15'), 'BDAY:1990-05-15'],
  [
    'addBirthday',
    (c) => c.addBirthday(new Date('1990-05-15T00:00:00Z')),
    'BDAY:1990-05-15',
  ],
  [
    'addBirthday',
    (c) => c.addBirthday('1953-10-15T23:10:00Z'),
    'BDAY;VALUE=date-time:1953-10-15T23:10:00Z',
  ],
  [
    'addBirthday',
    (c) => c.addBirthday('1953-10-15T23:10:00,5+01:00'),
    'BDAY;VALUE=date-time:1953-10-15T23:10:00,5+01:00',
  ],
  [
    'addBirthday',
    (c) => c.addBirthday('1953-10-15t23:10:00z'),
    'BDAY;VALUE=date-time:1953-10-15t23:10:00z',
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
    'addPhoto',
    (c) => c.addPhoto({ image: 'AAAA', mime: 'image/jpg' }),
    'PHOTO;ENCODING=b;TYPE=JPEG:AAAA',
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
  ['addKey', (c) => c.addKey({ key: 'AAAA', mime: '' }), 'KEY;ENCODING=b:AAAA'],
  ['addKey', (c) => c.addKey({ text: 'abc', mime: '' }), 'KEY;VALUE=text:abc'],
  [
    'addKey',
    (c) => c.addKey({ key: 'AAAA', mime: ' PGP ' }),
    'KEY;ENCODING=b;TYPE=PGP:AAAA',
  ],
  [
    'addKey',
    (c) => c.addKey({ text: 'abc', mime: ' PGP ' }),
    'KEY;VALUE=text;TYPE=PGP:abc',
  ],
  [
    'addKey',
    (c) => c.addKey({ key: 'AAAA', mime: '\tx509\r\n' }),
    'KEY;ENCODING=b;TYPE=X509:AAAA',
  ],
  [
    'addKey',
    (c) => c.addKey({ text: 'abc', mime: '\tx509\r\n' }),
    'KEY;VALUE=text;TYPE=X509:abc',
  ],
  [
    'addKey',
    (c) => c.addKey({ key: 'AAAA', mime: '   ' }),
    'KEY;ENCODING=b:AAAA',
  ],
  [
    'addKey',
    (c) => c.addKey({ text: 'abc', mime: '   ' }),
    'KEY;VALUE=text:abc',
  ],
  [
    'addKey',
    (c) => c.addKey({ key: 'AAAA', mime: ' PGP;X=1 ' }),
    'KEY;ENCODING=b;TYPE="PGP;X=1":AAAA',
  ],
  [
    'addKey',
    (c) => c.addKey({ text: 'abc', mime: ' PGP;X=1 ' }),
    'KEY;VALUE=text;TYPE="PGP;X=1":abc',
  ],
  [
    'addKey',
    (c) => c.addKey({ text: '-----BEGIN PGP PUBLIC KEY BLOCK-----\nAB\r\nCD' }),
    'KEY;VALUE=text;TYPE=PGP:-----BEGIN PGP PUBLIC KEY BLOCK-----\\nAB\\nCD',
  ],
  [
    'addKey',
    (c) => c.addKey({ text: 'a;b,c\\d' }),
    'KEY;VALUE=text;TYPE=PGP:a\\;b\\,c\\\\d',
  ],
  [
    'addKey',
    (c) => c.addKey({ text: 'abc', mime: 'x509' }),
    'KEY;VALUE=text;TYPE=X509:abc',
  ],
  [
    'addKey',
    (c) => c.addKey({ text: 'abc', mime: 'PGP;X=1' }),
    'KEY;VALUE=text;TYPE="PGP;X=1":abc',
  ],
  ['addUid', (c) => c.addUid('u;1,2\\x'), 'UID:u\\;1\\,2\\\\x'],
  [
    'addCategories',
    (c) => c.addCategories(['Rock, Pop', 'Jazz']),
    'CATEGORIES:Rock\\, Pop,Jazz',
  ],
  ['addCategories', (c) => c.addCategories(['a ', ' b']), 'CATEGORIES:a , b'],
  [
    'addNote',
    (c) => c.addNote('Call me; available, Mon\\Fri\nLeave message'),
    'NOTE:Call me\\; available\\, Mon\\\\Fri\\nLeave message',
  ],
  ['addSortString', (c) => c.addSortString('やまだ'), 'SORT-STRING:やまだ'],
  [
    'addRevision',
    (c) => c.addRevision(new Date('2024-01-15T10:30:00Z')),
    'REV:2024-01-15T10:30:00Z',
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
    expect([...new Set(mappings.map(([method]) => method))].sort()).toEqual(
      [...addMethods].sort(),
    )
  })

  it.each(mappings)(
    'should write the line of %s() in row %#',
    (_, add, line) => {
      const vCard = new VCard()
      add(vCard)
      expect(vCard.toString()).toContain(`\r\n${line}\r\n`)
    },
  )
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

  it('should trim spaces around the generated FN', () => {
    const vCard = new VCard()
    vCard.addName({ givenName: ' John ' })
    expect(vCard.toString()).toContain('\r\nFN:John\r\n')
  })

  it('should not generate FN when all name components are empty', () => {
    const vCard = new VCard()
    vCard.addName({})
    const output = vCard.toString()
    expect(output).toContain('N:;;;;')
    expect(output).not.toContain('FN:')
  })

  // Matches the property name exactly, with an optional group
  const fnLines = (vCard: VCard) =>
    vCard
      .toString()
      .split('\r\n')
      .filter((line) => /^(?:[A-Za-z0-9-]+\.)?FN[;:]/.test(line))

  it('should not generate FN when a custom FN property exists', () => {
    const vCard = new VCard()
    vCard.addCustomProperty({ name: 'fn', value: 'Custom' })
    vCard.addName({ givenName: 'John' })
    expect(fnLines(vCard)).toEqual(['FN:Custom'])
  })

  it.each(['FN', 'fn'])(
    'should not generate FN when a custom %s property with parameters exists',
    (name) => {
      const vCard = new VCard()
      vCard.addCustomProperty({ name, value: 'A', params: 'LANGUAGE=en' })
      vCard.addName({ givenName: 'B' })
      expect(fnLines(vCard)).toEqual(['FN;LANGUAGE=en:A'])
    },
  )

  it('should not generate FN when a grouped custom FN property exists', () => {
    const vCard = new VCard()
    vCard.addCustomProperty({ name: 'FN', value: 'A', group: 'item1' })
    vCard.addName({ givenName: 'B' })
    expect(fnLines(vCard)).toEqual(['item1.FN:A'])
  })

  it('should generate FN when a custom property name only starts with FN', () => {
    const vCard = new VCard()
    vCard.addCustomProperty({ name: 'FNX', value: 'A' })
    vCard.addName({ givenName: 'B' })
    expect(fnLines(vCard)).toEqual(['FN:B'])
  })
})

describe('addBirthday()', () => {
  it('should throw and store nothing on an invalid date string', () => {
    const vCard = new VCard()
    expect(() => vCard.addBirthday('1990-02-30')).toThrow(
      'Birthday values must be RFC 2425 dates or date-times, such as 1990-05-15 (got "1990-02-30")',
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
})

describe('addGeo()', () => {
  it('should throw and store nothing on an out-of-range latitude', () => {
    const vCard = new VCard()
    expect(() => vCard.addGeo({ latitude: 91, longitude: 0 })).toThrow(
      'Geo latitude values must be -90 to 90 (got 91)',
    )
    expect(vCard.getProperties()).toEqual([])
  })

  it.each([
    ['latitude', { latitude: NaN, longitude: 0 }, 'NaN'],
    ['longitude', { latitude: 0, longitude: '45' as never }, '"45"'],
  ])('should name the %s on a value that is not finite', (name, geo, shown) => {
    expect(() => new VCard().addGeo(geo)).toThrow(
      `Geo ${name} values must be finite numbers (got ${shown})`,
    )
  })

  it('should name the longitude on an out-of-range value', () => {
    expect(() => new VCard().addGeo({ latitude: 0, longitude: -181 })).toThrow(
      'Geo longitude values must be -180 to 180 (got -181)',
    )
  })
})

describe('addTimezone()', () => {
  it('should store nothing on an out-of-range offset and accept a valid one after it', () => {
    const vCard = new VCard()
    expect(() => vCard.addTimezone('+24:00')).toThrow(
      'Timezone values must be UTC offsets with hours 00 to 23 and minutes 00 to 59 (got "+24:00")',
    )
    expect(vCard.getProperties()).toEqual([])
    vCard.addTimezone('+01:00')
    expect(vCard.toString()).toContain('\r\nTZ:+01:00\r\n')
  })
})

describe('addRevision()', () => {
  freezeTime('2026-01-01T00:00:00Z')

  it('should write the custom revision only', () => {
    const vCard = new VCard()
    vCard.addRevision(new Date('2024-01-15T10:30:00Z'))
    expect(vCard.toString().match(/REV:/g)).toHaveLength(1)
  })

  it('should auto-generate REV when addRevision not called', () => {
    const vCard = new VCard()
    vCard.addName({ givenName: 'John' })
    expect(vCard.toString()).toContain('REV:2026-01-01T00:00:00Z\r\n')
  })

  it('should throw and store nothing on a Date in year 10000', () => {
    const vCard = new VCard()
    expect(() =>
      vCard.addRevision(new Date('+010000-01-01T00:00:00Z')),
    ).toThrow(
      'Revision values must have a UTC year from 0000 to 9999 (got 10000)',
    )
    expect(vCard.getProperties()).toEqual([])
  })

  it('should name the property on an invalid Date', () => {
    expect(() => new VCard().addRevision(new Date('x'))).toThrow(
      'Revision values must be valid Dates (got Invalid Date)',
    )
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

describe('addKey() text', () => {
  it('should write an ASCII-armored key on 1 line', () => {
    const body = 'A'.repeat(64)
    const armored = [
      '-----BEGIN PGP PUBLIC KEY BLOCK-----',
      '',
      body,
      body,
      '=AbCd',
      '-----END PGP PUBLIC KEY BLOCK-----',
    ].join('\n')
    const vCard = new VCard().addKey({ text: armored })

    const unfolded = vCard.toString().replace(/\r\n /g, '')
    expect(unfolded).toContain(
      `\r\nKEY;VALUE=text;TYPE=PGP:-----BEGIN PGP PUBLIC KEY BLOCK-----\\n\\n${body}\\n${body}\\n=AbCd\\n-----END PGP PUBLIC KEY BLOCK-----\r\n`,
    )
  })

  it('should allow all 3 forms on the same card', () => {
    const output = new VCard()
      .addKey({ url: 'https://example.com/a' })
      .addKey({ text: 'abc' })
      .addKey({ key: 'AAAA' })
      .toString()

    expect(output).toContain('\r\nKEY;VALUE=uri:https://example.com/a\r\n')
    expect(output).toContain('\r\nKEY;VALUE=text;TYPE=PGP:abc\r\n')
    expect(output).toContain('\r\nKEY;ENCODING=b;TYPE=PGP:AAAA\r\n')
  })

  it('should ignore undefined form keys', () => {
    const output = new VCard()
      .addKey({ key: 'AAAA', url: undefined })
      .addKey({ text: 'abc', url: undefined, key: undefined })
      .toString()

    expect(output).toContain('\r\nKEY;ENCODING=b;TYPE=PGP:AAAA\r\n')
    expect(output).toContain('\r\nKEY;VALUE=text;TYPE=PGP:abc\r\n')
  })
})

describe.each([
  [
    'addPhoto',
    'PHOTO',
    'Photo',
    (c: VCard, v: string) => c.addPhoto({ image: v }),
  ],
  ['addLogo', 'LOGO', 'Logo', (c: VCard, v: string) => c.addLogo({ image: v })],
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

  it.each(['data:image/png;base64,AAAA', 'DATA:image/png;base64,AAAA'])(
    'should throw and store nothing on the data URL %j',
    (value) => {
      const vCard = new VCard()
      expect(() => add(vCard, value)).toThrow(
        `${label} values must be raw base64 without a "data:" prefix (got "${value}"). Pass the MIME type as mime`,
      )
      expect(vCard.getProperties()).toEqual([])
    },
  )

  it('should write the sample image plain and wrapped as the same line', () => {
    const image = sampleImage
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

// Each row: the method, a call with the given value and the label in the
// error message
describe.each([
  ['addFullName', 'Full name', (c: VCard, v: string) => c.addFullName(v)],
  ['addName', 'Name', (c: VCard, v: string) => c.addName({ givenName: v })],
  ['addNickname', 'Nickname', (c: VCard, v: string) => c.addNickname(v)],
  ['addNickname', 'Nickname', (c: VCard, v: string) => c.addNickname([v])],
  ['addCompany', 'Company', (c: VCard, v: string) => c.addCompany({ name: v })],
  ['addJobtitle', 'Job title', (c: VCard, v: string) => c.addJobtitle(v)],
  ['addRole', 'Role', (c: VCard, v: string) => c.addRole(v)],
  ['addEmail', 'Email', (c: VCard, v: string) => c.addEmail({ address: v })],
  [
    'addAddress',
    'Address',
    (c: VCard, v: string) => c.addAddress({ street: v }),
  ],
  ['addLabel', 'Label', (c: VCard, v: string) => c.addLabel({ label: v })],
  ['addNote', 'Note', (c: VCard, v: string) => c.addNote(v)],
  ['addUid', 'UID', (c: VCard, v: string) => c.addUid(v)],
  ['addSortString', 'Sort string', (c: VCard, v: string) => c.addSortString(v)],
  [
    'addCategories',
    'Categories',
    (c: VCard, v: string) => c.addCategories([v]),
  ],
  ['addTimezone', 'Timezone', (c: VCard, v: string) => c.addTimezone(v)],
] as const)('%s() text errors', (_, label, add) => {
  it('should name the property on a control character', () => {
    expect(() => add(new VCard(), 'a\x00b')).toThrow(
      `${label} values must not contain control characters (got "a\\u0000b")`,
    )
  })

  it('should show at most 64 characters and the length of a long value', () => {
    const value = `${'a'.repeat(9_999)}\x00`
    expect(() => add(new VCard(), value)).toThrow(
      `${label} values must not contain control characters (got "${'a'.repeat(64)}"... (length 10000))`,
    )
  })
})

// Each row: the method, a call with the given value, a value with a control
// character and the label in the error message
describe.each([
  ['addUrl', (c: VCard, v: string) => c.addUrl({ url: v }), 'a\tb', 'URL'],
  ['addImpp', (c: VCard, v: string) => c.addImpp({ uri: v }), 'a\tb', 'IMPP'],
  [
    'addSocial',
    (c: VCard, v: string) => c.addSocial({ url: v, type: 'x' }),
    'a\tb',
    'Social profile',
  ],
  [
    'addPhoto',
    (c: VCard, v: string) => c.addPhoto({ url: v }),
    'a\tb',
    'Photo',
  ],
  ['addLogo', (c: VCard, v: string) => c.addLogo({ url: v }), 'a\tb', 'Logo'],
  ['addKey', (c: VCard, v: string) => c.addKey({ url: v }), 'a\tb', 'Key'],
  [
    'addPhoneNumber',
    (c: VCard, v: string) => c.addPhoneNumber({ number: v }),
    '1\n2',
    'Phone number',
  ],
  [
    'addCustomProperty',
    (c: VCard, v: string) => c.addCustomProperty({ name: 'x-a', value: v }),
    'a\nb',
    'X-A',
  ],
] as const)('%s() value errors', (_, add, value, label) => {
  it('should name the property on a control character', () => {
    const vCard = new VCard()
    expect(() => add(vCard, value)).toThrow(
      `${label} values must not contain control characters (got ${JSON.stringify(value)})`,
    )
    expect(vCard.getProperties()).toEqual([])
  })
})

describe('property errors', () => {
  it('should name the property on a second once-only call', () => {
    expect(() => new VCard().addSortString('a').addSortString('b')).toThrow(
      'Sort string must be added only once (got a second SORT-STRING)',
    )
  })

  it('should name the property on an invalid group', () => {
    expect(() =>
      new VCard().addCustomProperty({ name: 'X-A', value: 'a', group: 'a.b' }),
    ).toThrow(
      'X-A group values must contain only letters, digits and "-" (got "a.b")',
    )
  })

  it.each([
    [
      'a key mime',
      (c: VCard) => c.addKey({ key: 'AAAA', mime: 'a"b' }),
      'Key TYPE',
    ],
    [
      'a social profile user',
      (c: VCard) => c.addSocial({ url: 'u', type: 'x', user: 'a"b' }),
      'Social profile X-USER',
    ],
    [
      'a social profile type',
      (c: VCard) => c.addSocial({ url: 'u', type: 'a"b' }),
      'Social profile TYPE',
    ],
    [
      'a phone number type',
      (c: VCard) => c.addPhoneNumber({ number: '1', type: ['a"b' as never] }),
      'Phone number TYPE',
    ],
  ])('should name the property on %s with a double quote', (_, add, label) => {
    expect(() => add(new VCard())).toThrow(
      `${label} values must not contain a double quote (got "a\\"b")`,
    )
  })
})

describe('addBirthday() errors', () => {
  it.each([
    [42, 'number'],
    [null, 'null'],
    [{}, 'object'],
  ])('should throw on %j', (value, type) => {
    expect(() => new VCard().addBirthday(value as unknown as string)).toThrow(
      `Birthday values must be strings or Dates (got ${type})`,
    )
  })

  it('should name the property on an invalid date string', () => {
    expect(() => new VCard().addBirthday('foo')).toThrow(
      'Birthday values must be RFC 2425 dates or date-times, such as 1990-05-15 (got "foo")',
    )
  })

  it('should name the property on an invalid Date', () => {
    expect(() => new VCard().addBirthday(new Date('x'))).toThrow(
      'Birthday values must be valid Dates (got Invalid Date)',
    )
  })
})

describe('addCustomProperty()', () => {
  it('should throw and store nothing on an invalid name', () => {
    const vCard = new VCard()
    expect(() => vCard.addCustomProperty({ name: 'X:A', value: 'a' })).toThrow(
      'Property name values must contain only letters, digits and "-" (got "X:A")',
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
    ).toThrow(
      `Property name values must not be REV (got "${name}"). Use addRevision() with a Date`,
    )
  })

  it('should name a reserved name without a hint', () => {
    expect(() =>
      new VCard().addCustomProperty({ name: 'begin', value: 'a' }),
    ).toThrow('Property name values must not be BEGIN (got "begin")')
  })

  it.each(['X-L=a:b', 'X-L=a"b', 'WORK'])(
    'should throw and store nothing on params %j',
    (params) => {
      const vCard = new VCard()
      expect(() =>
        vCard.addCustomProperty({ name: 'x-a', value: 'v', params }),
      ).toThrow(
        `X-A parameter values must be name=value pairs separated by ";" (got ${JSON.stringify(params)}). Put a value with ";", ":" or "," in double quotes. A value cannot contain a double quote`,
      )
      expect(vCard.getProperties()).toEqual([])
    },
  )

  it('should name the property on a control character in params', () => {
    expect(() =>
      new VCard().addCustomProperty({
        name: 'X-A',
        value: 'v',
        params: 'X=a\nb',
      }),
    ).toThrow(
      'X-A parameter values must not contain control characters (got "X=a\\nb")',
    )
  })

  it.each(['X-L="a:b"', 'TYPE=work,home', 'TYPE=work;X-A=1'])(
    'should write params %j as they are',
    (params) => {
      const vCard = new VCard()
      vCard.addCustomProperty({ name: 'X-A', value: 'v', params })
      expect(vCard.toString()).toContain(`\r\nX-A;${params}:v\r\n`)
    },
  )

  it.each(['X-END', 'ENDX', 'X-REV', 'REVISION'])(
    'should accept name %j',
    (name) => {
      const vCard = new VCard()
      vCard.addCustomProperty({ name, value: 'a' })
      expect(vCard.toString()).toContain(`\r\n${name}:a\r\n`)
    },
  )
})
