import { vi } from 'vitest'
import VCard from './VCard'
import VCardException from './VCardException'
import type { DateString, EmailType, SocialOptions } from './types/VCard'

describe('addFullName()', () => {
  it('should set FN directly', () => {
    const vCard = new VCard()
    vCard.addFullName('Madonna')
    expect(vCard.toString()).toContain('FN:Madonna')
  })

  it('should override auto-generated FN when called before addName', () => {
    const vCard = new VCard()
    vCard.addFullName('The Company').addName({ familyName: 'Inc' })
    const output = vCard.toString()
    expect(output).toContain('FN:The Company')
    expect(output).not.toContain('FN:Inc')
  })

  it('should escape special characters', () => {
    const vCard = new VCard()
    vCard.addFullName('Smith, John; Jr.')
    expect(vCard.toString()).toContain('FN:Smith\\, John\\; Jr.')
  })

  it('should throw on duplicate addFullName', () => {
    const vCard = new VCard()
    vCard.addFullName('First')
    expect(() => vCard.addFullName('Second')).toThrow(VCardException)
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
    const fnMatches = output.match(/FN/g)
    expect(fnMatches).toHaveLength(1)
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
  it('should set structured name with options', () => {
    const vCard = new VCard()
    vCard.addName({
      givenName: 'John',
      familyName: 'Doe',
      honorificPrefix: 'Dr.',
    })
    const output = vCard.toString()
    expect(output).toContain('N:Doe;John;;Dr.;')
    expect(output).toContain('FN:Dr. John Doe')
  })

  it('should not generate FN when all name components are empty', () => {
    const vCard = new VCard()
    vCard.addName({})
    const output = vCard.toString()
    expect(output).toContain('N:;;;;')
    expect(output).not.toContain('FN:')
  })

  it('should generate FN when name has components', () => {
    const vCard = new VCard()
    vCard.addName({ givenName: 'John' })
    expect(vCard.toString()).toContain('FN:John')
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

  it('should throw on duplicate addName', () => {
    const vCard = new VCard()
    vCard.addName({ familyName: 'Desloovere', givenName: 'Jeroen' })
    expect(() => {
      vCard.addName({ familyName: 'Desloovere', givenName: 'Jeroen' })
    }).toThrow(VCardException)
  })
})

describe('addNickname()', () => {
  it('should allow multiple addNickname calls', () => {
    const vCard = new VCard()
    vCard.addNickname('Johnny').addNickname('JD')
    const output = vCard.toString()
    expect(output).toContain('NICKNAME:Johnny')
    expect(output).toContain('NICKNAME:JD')
  })
})

describe('addBirthday()', () => {
  it('should accept a Date object', () => {
    const vCard = new VCard()
    vCard.addBirthday(new Date('1990-05-15T00:00:00Z'))
    expect(vCard.toString()).toContain('BDAY:1990-05-15')
  })

  it('should accept a DateString', () => {
    const vCard = new VCard()
    vCard.addBirthday('1990-05-15')
    expect(vCard.toString()).toContain('BDAY:1990-05-15')
  })

  it('should produce identical output for Date and DateString', () => {
    const vCard1 = new VCard()
    vCard1.addBirthday(new Date('1990-05-15T00:00:00Z'))

    const vCard2 = new VCard()
    vCard2.addBirthday('1990-05-15')

    const bday1 = vCard1.getProperties().find((p) => p.key === 'BDAY')
    const bday2 = vCard2.getProperties().find((p) => p.key === 'BDAY')
    expect(bday1?.value).toBe(bday2?.value)
  })

  it('should throw on duplicate addBirthday', () => {
    const vCard = new VCard()
    vCard.addBirthday('1990-05-15')
    expect(() => vCard.addBirthday('1991-06-20')).toThrow(VCardException)
  })

  it.each(['\n', '\r', '\r\n'])(
    'should throw and store nothing on control character %j in a string',
    (char) => {
      const vCard = new VCard()
      expect(() =>
        vCard.addBirthday(`1990-05-15${char}X-INJECTED:1` as DateString),
      ).toThrow(VCardException)
      expect(vCard.getProperties()).toEqual([])
    },
  )

  it.each([
    '1990-05-15',
    '19900515',
    '1953-10-15T23:10:00Z',
    '19531015T231000Z',
    '1953-10-15T23:10:00,5+01:00',
    '1953-10-15T23:10:00-0500',
    '1953-10-15T23:10:00',
    '2024-02-29',
    '2000-02-29',
    '0000-02-29',
    '1990-12-31T23:59:60Z',
  ])('should write the RFC 2425 date or date-time %j as it is', (value) => {
    const vCard = new VCard()
    vCard.addBirthday(value)
    expect(vCard.toString()).toContain(`BDAY:${value}\r\n`)
  })

  it.each([
    'not-a-date',
    '1990-5-15',
    '1990-05-15T00:00Z',
    '1953-10-15T23:10:00.5Z',
    '1990-02-30',
    '2023-02-29',
    '1900-02-29',
    '1990-13-01',
    '1990-00-10',
    '1990-04-31',
    '1990-05-00',
    '1990-05-15T24:00:00Z',
    '1990-05-15T23:60:00Z',
    '1990-05-15T23:10:61Z',
    '1990-05-15T23:10:00+24:00',
    ' 1990-05-15',
    '',
  ])('should throw and store nothing on string %j', (value) => {
    const vCard = new VCard()
    expect(() => vCard.addBirthday(value as DateString)).toThrow(VCardException)
    expect(vCard.getProperties()).toEqual([])
  })

  it('should show the rejected string with escapes in the message', () => {
    expect(() => new VCard().addBirthday('1990-05-15\n' as DateString)).toThrow(
      'Invalid birthday: must be an RFC 2425 date or date-time, such as 1990-05-15 (got "1990-05-15\\n")',
    )
  })

  it.each([
    ['+010000-01-01T00:00:00Z', 10000],
    ['-000001-01-01T00:00:00Z', -1],
  ])('should throw and store nothing on a Date in year %s', (iso, year) => {
    const vCard = new VCard()
    expect(() => vCard.addBirthday(new Date(iso))).toThrow(
      `Invalid birthday: the year must be 0000 to 9999 (got ${year})`,
    )
    expect(vCard.getProperties()).toEqual([])
  })

  it.each([
    ['0000-01-01T00:00:00Z', '0000-01-01'],
    ['9999-12-31T00:00:00Z', '9999-12-31'],
  ])('should accept a Date at the year limit (%s)', (iso, expected) => {
    const vCard = new VCard()
    vCard.addBirthday(new Date(iso))
    expect(vCard.toString()).toContain(`BDAY:${expected}\r\n`)
  })
})

describe('addCompany()', () => {
  it('should set organization with department', () => {
    const vCard = new VCard()
    vCard.addCompany({ name: 'Acme Corp', department: 'Engineering' })
    expect(vCard.toString()).toContain('ORG:Acme Corp;Engineering')
  })

  it('should throw on duplicate addCompany', () => {
    const vCard = new VCard()
    vCard.addCompany({ name: 'Acme' })
    expect(() => vCard.addCompany({ name: 'Other' })).toThrow(VCardException)
  })
})

describe('addJobtitle()', () => {
  it('should throw on duplicate addJobtitle', () => {
    const vCard = new VCard()
    vCard.addJobtitle('Developer')
    expect(() => vCard.addJobtitle('Manager')).toThrow(VCardException)
  })
})

describe('addRole()', () => {
  it('should throw on duplicate addRole', () => {
    const vCard = new VCard()
    vCard.addRole('Engineer')
    expect(() => vCard.addRole('Architect')).toThrow(VCardException)
  })
})

describe('addEmail()', () => {
  it('should set email with typed array', () => {
    const vCard = new VCard()
    vCard.addEmail({ address: 'john@example.com', type: ['pref', 'work'] })
    expect(vCard.toString()).toContain('EMAIL;TYPE=PREF,WORK:john@example.com')
  })

  it('should set email without type', () => {
    const vCard = new VCard()
    vCard.addEmail({ address: 'john@example.com' })
    expect(vCard.toString()).toContain('EMAIL:john@example.com')
  })

  it('should allow multiple addEmail calls', () => {
    const vCard = new VCard()
    vCard
      .addEmail({ address: 'work@example.com', type: ['work'] })
      .addEmail({ address: 'home@example.com', type: ['home'] })

    const output = vCard.toString()
    expect(output).toContain('EMAIL;TYPE=WORK:work@example.com')
    expect(output).toContain('EMAIL;TYPE=HOME:home@example.com')
  })

  it.each(['\n', '\r', '\r\n'])(
    'should throw and store nothing on control character %j in address',
    (char) => {
      const vCard = new VCard()
      expect(() =>
        vCard.addEmail({ address: `a@example.com${char}X-INJECTED:1` }),
      ).toThrow(VCardException)
      expect(vCard.getProperties()).toEqual([])
    },
  )

  it('should throw and store nothing on a type entry with a line break', () => {
    const vCard = new VCard()
    expect(() =>
      vCard.addEmail({
        address: 'a@example.com',
        type: ['work\nX-INJECTED:1' as EmailType],
      }),
    ).toThrow(VCardException)
    expect(vCard.getProperties()).toEqual([])
  })
})

describe('addPhoneNumber()', () => {
  it('should set phone with typed array', () => {
    const vCard = new VCard()
    vCard.addPhoneNumber({ number: '+1-555-0100', type: ['cell'] })
    expect(vCard.toString()).toContain('TEL;TYPE=CELL:+1-555-0100')
  })

  it('should accept numeric phone number', () => {
    const vCard = new VCard()
    vCard.addPhoneNumber({ number: 1234567890 })
    expect(vCard.toString()).toContain('TEL:1234567890')
  })

  it('should allow multiple addPhoneNumber calls', () => {
    const vCard = new VCard()
    vCard
      .addPhoneNumber({ number: '+1-555-0001', type: ['work'] })
      .addPhoneNumber({ number: '+1-555-0002', type: ['cell'] })

    const output = vCard.toString()
    expect(output).toContain('TEL;TYPE=WORK:+1-555-0001')
    expect(output).toContain('TEL;TYPE=CELL:+1-555-0002')
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

  it.each([
    [0, 'TEL:0'],
    [-1, 'TEL:-1'],
  ])('should accept the finite number %s', (number, expected) => {
    const vCard = new VCard()
    vCard.addPhoneNumber({ number })
    expect(vCard.toString()).toContain(`${expected}\r\n`)
  })

  it.each(['\n', '\r', '\r\n'])(
    'should throw and store nothing on control character %j in number',
    (char) => {
      const vCard = new VCard()
      expect(() =>
        vCard.addPhoneNumber({ number: `+1-555-0100${char}X-INJECTED:1` }),
      ).toThrow(VCardException)
      expect(vCard.getProperties()).toEqual([])
    },
  )
})

describe('addUrl()', () => {
  it('should set url with typed array', () => {
    const vCard = new VCard()
    vCard.addUrl({ url: 'https://example.com', type: ['work'] })
    expect(vCard.toString()).toContain('URL;TYPE=WORK:https://example.com')
  })

  it('should allow multiple addUrl calls', () => {
    const vCard = new VCard()
    vCard
      .addUrl({ url: 'https://work.example.com', type: ['work'] })
      .addUrl({ url: 'https://home.example.com', type: ['home'] })

    const output = vCard.toString()
    expect(output).toContain('URL;TYPE=WORK:https://work.example.com')
    expect(output).toContain('URL;TYPE=HOME:https://home.example.com')
  })

  it.each(['\n', '\r'])(
    'should throw and store nothing on control character %j in url',
    (char) => {
      const vCard = new VCard()
      expect(() =>
        vCard.addUrl({ url: `https://example.com/a${char}X-INJECTED:1` }),
      ).toThrow(VCardException)
      expect(vCard.getProperties()).toEqual([])
    },
  )
})

describe('addAddress()', () => {
  it('should set address with options and typed array', () => {
    const vCard = new VCard()
    vCard.addAddress({
      street: '123 Main St',
      locality: 'Springfield',
      region: 'IL',
      postalCode: '62701',
      country: 'USA',
      type: ['home', 'postal'],
    })
    const output = vCard.toString()
    expect(output).toContain('ADR;TYPE=HOME,POSTAL:')
    expect(output).toContain('123 Main St;Springfield;IL;62701;USA')
  })

  it('should use RFC 2426 default type', () => {
    const vCard = new VCard()
    vCard.addAddress({ street: '123 Main St' })
    expect(vCard.toString()).toContain('ADR;TYPE=INTL,POSTAL,PARCEL,WORK:')
  })

  it('should omit TYPE when empty array provided', () => {
    const vCard = new VCard()
    vCard.addAddress({ street: 'Main St', type: [] })
    const output = vCard.toString()
    expect(output).toContain('ADR:')
    expect(output).not.toContain('TYPE=')
  })

  it('should allow multiple addAddress calls', () => {
    const vCard = new VCard()
    vCard
      .addAddress({ street: '123 Work St', type: ['work'] })
      .addAddress({ street: '456 Home Ave', type: ['home'] })

    const output = vCard.toString()
    expect(output).toContain('ADR;TYPE=WORK:;;123 Work St;;;;')
    expect(output).toContain('ADR;TYPE=HOME:;;456 Home Ave;;;;')
  })
})

describe('addLabel()', () => {
  it('should add label with default type', () => {
    const vCard = new VCard()
    vCard.addLabel({ label: '123 Main St\nSpringfield, IL 62701' })
    expect(vCard.toString()).toContain('LABEL;TYPE=INTL,POSTAL,PARCEL,WORK:')
  })

  it('should add label with custom type', () => {
    const vCard = new VCard()
    vCard.addLabel({ label: 'Home address', type: ['home'] })
    expect(vCard.toString()).toContain('LABEL;TYPE=HOME:Home address')
  })

  it('should escape newlines in label', () => {
    const vCard = new VCard()
    vCard.addLabel({ label: 'Line 1\nLine 2' })
    expect(vCard.toString()).toContain('Line 1\\nLine 2')
  })

  it('should escape semicolons and commas in label', () => {
    const vCard = new VCard()
    vCard.addLabel({ label: 'Floor 2; Suite 5, Room A' })
    expect(vCard.toString()).toContain('Floor 2\\; Suite 5\\, Room A')
  })

  it('should allow multiple labels', () => {
    const vCard = new VCard()
    vCard.addLabel({ label: 'Work address', type: ['work'] })
    vCard.addLabel({ label: 'Home address', type: ['home'] })
    const output = vCard.toString()
    expect(output).toContain('LABEL;TYPE=WORK:Work address')
    expect(output).toContain('LABEL;TYPE=HOME:Home address')
  })
})

describe('type entries', () => {
  const methods: [string, string, (c: VCard, t: string) => VCard][] = [
    [
      'addEmail',
      'EMAIL',
      (c, t) =>
        c.addEmail({ address: 'a@example.com', type: [t as EmailType] }),
    ],
    [
      'addPhoneNumber',
      'TEL',
      (c, t) =>
        c.addPhoneNumber({ number: '1', type: [t as unknown as 'cell'] }),
    ],
    [
      'addUrl',
      'URL',
      (c, t) =>
        c.addUrl({ url: 'https://a.example', type: [t as unknown as 'work'] }),
    ],
    [
      'addAddress',
      'ADR',
      (c, t) => c.addAddress({ type: [t as unknown as 'work'] }),
    ],
    [
      'addLabel',
      'LABEL',
      (c, t) => c.addLabel({ label: 'x', type: [t as unknown as 'work'] }),
    ],
  ]

  it.each(methods)(
    '%s should quote an entry with a semicolon',
    (_, key, add) => {
      const vCard = new VCard()
      add(vCard, 'a;b')
      expect(vCard.toString()).toContain(`${key};TYPE="A;B":`)
    },
  )

  it.each(methods)(
    '%s should throw and store nothing on a double quote',
    (_, __, add) => {
      const vCard = new VCard()
      expect(() => add(vCard, 'a"b')).toThrow(VCardException)
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

  it('should include x-user when provided', () => {
    const vCard = new VCard()
    vCard.addSocial({ url: 'https://x.com/jdoe', type: 'X', user: 'jdoe' })
    const output = vCard.toString()
    expect(output).toContain(
      'X-SOCIALPROFILE;type=X;x-user=jdoe:https://x.com/jdoe',
    )
    expect(output).toContain('IMPP;X-SERVICE-TYPE=X:https://x.com/jdoe')
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

  it('should allow multiple social profiles', () => {
    const vCard = new VCard()
    vCard
      .addSocial({ url: 'https://x.com/jdoe', type: 'X', user: 'jdoe' })
      .addSocial({ url: 'https://linkedin.com/in/jdoe', type: 'LinkedIn' })

    const output = vCard.toString()
    expect(output).toContain('X-SOCIALPROFILE;type=X;x-user=jdoe')
    expect(output).toContain('IMPP;X-SERVICE-TYPE=X:https://x.com/jdoe')
    expect(output).toContain('X-SOCIALPROFILE;type=LinkedIn')
    expect(output).toContain(
      'IMPP;X-SERVICE-TYPE=LinkedIn:https://linkedin.com/in/jdoe',
    )
  })

  it('should quote a type with a semicolon', () => {
    const vCard = new VCard()
    vCard.addSocial({ url: 'u', type: 'My Site;x' })

    const output = vCard.toString()
    expect(output).toContain('X-SOCIALPROFILE;type="My Site;x":u')
    expect(output).toContain('IMPP;X-SERVICE-TYPE="My Site;x":u')
  })

  it('should quote a user with a comma', () => {
    const vCard = new VCard()
    vCard.addSocial({ url: 'u', type: 'X', user: 'a,b' })

    expect(vCard.toString()).toContain('X-SOCIALPROFILE;type=X;x-user="a,b":u')
  })

  it('should throw on a double quote in type or user', () => {
    expect(() => new VCard().addSocial({ url: 'u', type: 'a"b' })).toThrow(
      VCardException,
    )
    expect(() =>
      new VCard().addSocial({ url: 'u', type: 'X', user: 'a"b' }),
    ).toThrow(VCardException)
  })

  it('should store nothing when user has a double quote', () => {
    const vCard = new VCard()
    expect(() => vCard.addSocial({ url: 'u', type: 'X', user: 'a"b' })).toThrow(
      VCardException,
    )

    const output = vCard.toString()
    expect(output).not.toContain('X-SOCIALPROFILE')
    expect(output).not.toContain('IMPP')
  })

  it('should store nothing when type has a double quote', () => {
    const vCard = new VCard()
    expect(() => vCard.addSocial({ url: 'u', type: 'a"b' })).toThrow(
      VCardException,
    )

    const output = vCard.toString()
    expect(output).not.toContain('X-SOCIALPROFILE')
    expect(output).not.toContain('IMPP')
  })

  it('should throw on a line break in type or user', () => {
    expect(() =>
      new VCard().addSocial({ url: 'u', type: 'X\r\nEMAIL:x@example.com' }),
    ).toThrow(VCardException)
    expect(() =>
      new VCard().addSocial({ url: 'u', type: 'X', user: 'a\nb' }),
    ).toThrow(VCardException)
  })

  it('should write a URL with a comma and a semicolon as it is', () => {
    const vCard = new VCard()
    vCard.addSocial({ url: 'https://example.com/a;b?c=1,2', type: 'X' })

    const output = vCard.toString()
    expect(output).toContain(
      'X-SOCIALPROFILE;type=X:https://example.com/a;b?c=1,2',
    )
    expect(output).toContain(
      'IMPP;X-SERVICE-TYPE=X:https://example.com/a;b?c=1,2',
    )
  })

  it.each(['\n', '\r'])(
    'should throw and store nothing on control character %j in url',
    (char) => {
      const vCard = new VCard()
      expect(() =>
        vCard.addSocial({
          url: `https://x.com/a${char}X-INJECTED:1`,
          type: 'X',
        }),
      ).toThrow(VCardException)
      expect(vCard.getProperties()).toEqual([])

      const output = vCard.toString()
      expect(output).not.toContain('X-SOCIALPROFILE')
      expect(output).not.toContain('IMPP')
    },
  )
})

describe('addImpp()', () => {
  it('should add IMPP with service type', () => {
    const vCard = new VCard()
    vCard.addImpp({ uri: 'xmpp:user@example.com', serviceType: 'XMPP' })

    const output = vCard.toString()
    expect(output).toContain('IMPP;X-SERVICE-TYPE=XMPP:xmpp:user@example.com')
    expect(output).not.toContain('X-SOCIALPROFILE')
  })

  it('should add IMPP without service type', () => {
    const vCard = new VCard()
    vCard.addImpp({ uri: 'sip:user@example.com' })

    const output = vCard.toString()
    expect(output).toContain('IMPP:sip:user@example.com')
    expect(output).not.toContain('X-SERVICE-TYPE')
  })

  it('should allow multiple IMPP entries', () => {
    const vCard = new VCard()
    vCard
      .addImpp({ uri: 'xmpp:user@example.com', serviceType: 'XMPP' })
      .addImpp({ uri: 'sip:user@example.com', serviceType: 'SIP' })

    const output = vCard.toString()
    expect(output).toContain('IMPP;X-SERVICE-TYPE=XMPP:xmpp:user@example.com')
    expect(output).toContain('IMPP;X-SERVICE-TYPE=SIP:sip:user@example.com')
  })

  it('should quote a service type with a colon', () => {
    const vCard = new VCard()
    vCard.addImpp({ uri: 'xmpp:user@example.com', serviceType: 'a:b' })

    expect(vCard.toString()).toContain(
      'IMPP;X-SERVICE-TYPE="a:b":xmpp:user@example.com',
    )
  })

  it('should throw on a double quote in service type', () => {
    expect(() =>
      new VCard().addImpp({ uri: 'sip:user@example.com', serviceType: 'a"b' }),
    ).toThrow(VCardException)
  })

  it('should write a URI with a comma and a semicolon as it is', () => {
    const vCard = new VCard()
    vCard.addImpp({ uri: 'https://example.com/a;b?c=1,2' })

    expect(vCard.toString()).toContain('IMPP:https://example.com/a;b?c=1,2')
  })

  it.each(['\n', '\r'])(
    'should throw and store nothing on control character %j in uri',
    (char) => {
      const vCard = new VCard()
      expect(() =>
        vCard.addImpp({ uri: `sip:user@example.com${char}X-INJECTED:1` }),
      ).toThrow(VCardException)
      expect(vCard.getProperties()).toEqual([])
    },
  )
})

describe('addGeo()', () => {
  it('should add geographic position', () => {
    const vCard = new VCard()
    vCard.addGeo({ latitude: 37.386013, longitude: -122.082932 })
    expect(vCard.toString()).toContain('GEO:37.386013;-122.082932')
  })

  it('should accept boundary values', () => {
    const vCard = new VCard()
    vCard.addGeo({ latitude: -90, longitude: 180 })
    expect(vCard.toString()).toContain('GEO:-90;180')
  })

  it('should throw on invalid latitude', () => {
    const vCard = new VCard()
    expect(() => vCard.addGeo({ latitude: 91, longitude: 0 })).toThrow(
      VCardException,
    )
    expect(() => vCard.addGeo({ latitude: -91, longitude: 0 })).toThrow(
      VCardException,
    )
  })

  it('should throw on invalid longitude', () => {
    const vCard = new VCard()
    expect(() => vCard.addGeo({ latitude: 0, longitude: 181 })).toThrow(
      VCardException,
    )
    expect(() => vCard.addGeo({ latitude: 0, longitude: -181 })).toThrow(
      VCardException,
    )
  })

  const nonFiniteValues: [string, unknown][] = [
    ['NaN', NaN],
    ['Infinity', Infinity],
    ['-Infinity', -Infinity],
    ["'abc'", 'abc'],
    ["'45'", '45'],
    ['null', null],
    ['undefined', undefined],
    ['{}', {}],
    ["Symbol('x')", Symbol('x')],
  ]

  it.each(nonFiniteValues)('should throw on latitude %s', (_, value) => {
    const vCard = new VCard()
    const addGeo = () =>
      vCard.addGeo({ latitude: value as unknown as number, longitude: 0 })
    expect(addGeo).toThrow(VCardException)
    expect(addGeo).toThrow(/finite number/)
  })

  it.each(nonFiniteValues)('should throw on longitude %s', (_, value) => {
    const vCard = new VCard()
    const addGeo = () =>
      vCard.addGeo({ latitude: 0, longitude: value as unknown as number })
    expect(addGeo).toThrow(VCardException)
    expect(addGeo).toThrow(/finite number/)
  })

  it('should throw VCardException for an object without a prototype', () => {
    const vCard = new VCard()
    const addGeo = () =>
      vCard.addGeo({
        latitude: Object.create(null) as unknown as number,
        longitude: 0,
      })
    expect(addGeo).toThrow(VCardException)
    expect(addGeo).toThrow(/finite number/)
  })

  it('should write very small values without exponent notation', () => {
    const vCard = new VCard()
    vCard.addGeo({ latitude: 1e-7, longitude: -5e-7 })
    expect(vCard.toString()).toContain('GEO:0.0000001;-0.0000005')
  })

  it('should not write GEO when a value is NaN', () => {
    const vCard = new VCard()
    expect(() => vCard.addGeo({ latitude: NaN, longitude: NaN })).toThrow(
      VCardException,
    )
    expect(vCard.toString()).not.toContain('GEO:')
  })

  it('should throw on duplicate addGeo', () => {
    const vCard = new VCard()
    vCard.addGeo({ latitude: 37, longitude: -122 })
    expect(() => vCard.addGeo({ latitude: 40, longitude: -74 })).toThrow(
      VCardException,
    )
  })
})

describe('addTimezone()', () => {
  it('should add positive UTC offset timezone', () => {
    const vCard = new VCard()
    vCard.addTimezone('+01:00')
    expect(vCard.toString()).toContain('TZ:+01:00')
  })

  it('should add IANA timezone name with VALUE=text', () => {
    const vCard = new VCard()
    vCard.addTimezone('America/New_York')
    expect(vCard.toString()).toContain('TZ;VALUE=text:America/New_York')
    expect(vCard.toString()).not.toContain('\r\nTZ:America/New_York')
  })

  it('should escape a newline in a text value', () => {
    const vCard = new VCard()
    vCard.addTimezone('UTC\nX-INJECTED:1')
    const lines = vCard.toString().split('\r\n')
    expect(lines).toContain('TZ;VALUE=text:UTC\\nX-INJECTED:1')
    expect(lines.filter((line) => line.startsWith('X-INJECTED'))).toHaveLength(
      0,
    )
    expect(lines.filter((line) => line.startsWith('TZ'))).toHaveLength(1)
  })

  it('should escape a CRLF in a text value', () => {
    const vCard = new VCard()
    vCard.addTimezone('UTC\r\nX-INJECTED:1')
    const lines = vCard.toString().split('\r\n')
    expect(lines).toContain('TZ;VALUE=text:UTC\\nX-INJECTED:1')
    expect(lines.filter((line) => line.startsWith('X-INJECTED'))).toHaveLength(
      0,
    )
    expect(lines.filter((line) => line.startsWith('TZ'))).toHaveLength(1)
  })

  it('should escape semicolons and commas in a text value', () => {
    const vCard = new VCard()
    vCard.addTimezone('-05:00; EST, Raleigh')
    expect(vCard.toString()).toContain('TZ;VALUE=text:-05:00\\; EST\\, Raleigh')
  })

  it('should escape a backslash in a text value', () => {
    const vCard = new VCard()
    vCard.addTimezone('a\\b')
    expect(vCard.toString()).toContain('TZ;VALUE=text:a\\\\b')
  })

  it('should escape a value that starts like a UTC offset', () => {
    const vCard = new VCard()
    vCard.addTimezone('+01:00\nX-INJECTED:1')
    const lines = vCard.toString().split('\r\n')
    expect(lines).toContain('TZ;VALUE=text:+01:00\\nX-INJECTED:1')
    expect(lines.filter((line) => line.startsWith('X-INJECTED'))).toHaveLength(
      0,
    )
    expect(lines.filter((line) => line.startsWith('TZ'))).toHaveLength(1)
  })

  it.each(['-05:00', '+00:00', '+14:00', '+23:59'])(
    'should write offset %s as it is',
    (offset) => {
      const vCard = new VCard()
      vCard.addTimezone(offset)
      expect(vCard.toString()).toContain(`\r\nTZ:${offset}\r\n`)
      expect(vCard.toString()).not.toContain('VALUE=text')
    },
  )

  it.each(['+24:00', '-25:00', '+05:60', '+99:99'])(
    'should throw on out-of-range offset %s',
    (offset) => {
      const vCard = new VCard()
      expect(() => vCard.addTimezone(offset)).toThrow(VCardException)
      expect(vCard.toString()).not.toContain('TZ')
    },
  )

  it('should accept a valid offset after rejecting an invalid one', () => {
    const vCard = new VCard()
    expect(() => vCard.addTimezone('+24:00')).toThrow(VCardException)
    vCard.addTimezone('+01:00')
    expect(vCard.toString()).toContain('TZ:+01:00')
  })

  it('should throw on duplicate addTimezone', () => {
    const vCard = new VCard()
    vCard.addTimezone('-05:00')
    expect(() => vCard.addTimezone('+09:00')).toThrow(VCardException)
  })
})

describe('addPhoto()', () => {
  it('should add photo by URL', () => {
    const vCard = new VCard()
    vCard.addPhoto({ url: 'https://example.com/photo.jpg' })
    expect(vCard.toString()).toContain(
      'PHOTO;VALUE=uri:https://example.com/photo.jpg',
    )
  })

  it('should add photo with base64 and MIME', () => {
    const vCard = new VCard()
    vCard.addPhoto({ image: 'base64data', mime: 'png' })
    expect(vCard.toString()).toContain('PHOTO;ENCODING=b;TYPE=PNG:base64data')
  })

  it('should throw on invalid MIME type', () => {
    const vCard = new VCard()
    expect(() => {
      vCard.addPhoto({ image: 'data', mime: 'foobar' })
    }).toThrow(VCardException)
  })

  it('should allow both base64 and URL on the same card', () => {
    const vCard = new VCard()
    vCard
      .addPhoto({ image: 'base64data', mime: 'jpeg' })
      .addPhoto({ url: 'https://example.com/photo.jpg' })

    const output = vCard.toString()
    expect(output).toContain('PHOTO;ENCODING=b;TYPE=JPEG:base64data')
    expect(output).toContain('PHOTO;VALUE=uri:https://example.com/photo.jpg')
  })

  it('should allow multiple embedded photos', () => {
    const vCard = new VCard()
    vCard
      .addPhoto({ image: 'thumb64', mime: 'jpeg' })
      .addPhoto({ image: 'hires64', mime: 'png' })

    const output = vCard.toString()
    expect(output).toContain('PHOTO;ENCODING=b;TYPE=JPEG:thumb64')
    expect(output).toContain('PHOTO;ENCODING=b;TYPE=PNG:hires64')
  })

  it('should write a URL with a comma and a semicolon as it is', () => {
    const vCard = new VCard()
    vCard.addPhoto({ url: 'https://example.com/a;b?c=1,2' })

    expect(vCard.toString()).toContain(
      'PHOTO;VALUE=uri:https://example.com/a;b?c=1,2',
    )
  })

  it.each(['\n', '\r'])(
    'should throw and store nothing on control character %j in url',
    (char) => {
      const vCard = new VCard()
      expect(() =>
        vCard.addPhoto({ url: `https://example.com/a${char}X-INJECTED:1` }),
      ).toThrow(VCardException)
      expect(vCard.getProperties()).toEqual([])
    },
  )
})

describe('addLogo()', () => {
  it('should add logo by URL', () => {
    const vCard = new VCard()
    vCard.addLogo({ url: 'https://example.com/logo.png' })
    expect(vCard.toString()).toContain(
      'LOGO;VALUE=uri:https://example.com/logo.png',
    )
  })

  it('should add logo with base64 and MIME', () => {
    const vCard = new VCard()
    vCard.addLogo({ image: 'base64data', mime: 'jpeg' })
    expect(vCard.toString()).toContain('LOGO;ENCODING=b;TYPE=JPEG:base64data')
  })

  it('should allow both base64 and URL on the same card', () => {
    const vCard = new VCard()
    vCard
      .addLogo({ image: 'base64logo', mime: 'png' })
      .addLogo({ url: 'https://example.com/logo.png' })

    const output = vCard.toString()
    expect(output).toContain('LOGO;ENCODING=b;TYPE=PNG:base64logo')
    expect(output).toContain('LOGO;VALUE=uri:https://example.com/logo.png')
  })

  it('should write a URL with a comma and a semicolon as it is', () => {
    const vCard = new VCard()
    vCard.addLogo({ url: 'https://example.com/a;b?c=1,2' })

    expect(vCard.toString()).toContain(
      'LOGO;VALUE=uri:https://example.com/a;b?c=1,2',
    )
  })

  it.each(['\n', '\r'])(
    'should throw and store nothing on control character %j in url',
    (char) => {
      const vCard = new VCard()
      expect(() =>
        vCard.addLogo({ url: `https://example.com/a${char}X-INJECTED:1` }),
      ).toThrow(VCardException)
      expect(vCard.getProperties()).toEqual([])
    },
  )
})

describe.each([
  ['addPhoto', 'PHOTO'],
  ['addLogo', 'LOGO'],
] as const)('%s() MIME type', (method, property) => {
  it.each([
    ['jpg', 'JPEG'],
    ['JPG', 'JPEG'],
    ['image/png', 'PNG'],
    ['image/jpeg', 'JPEG'],
    ['IMAGE/PNG', 'PNG'],
    ['image/jpg', 'JPEG'],
    ['png', 'PNG'],
    ['jpeg', 'JPEG'],
    ['JPEG', 'JPEG'],
    ['jxrA', 'JXRA'],
    ['jxra', 'JXRA'],
    ['jxrS', 'JXRS'],
  ])("should write '%s' as TYPE=%s", (mime, type) => {
    const vCard = new VCard()
    vCard[method]({ image: 'data', mime })
    expect(vCard.toString()).toContain(
      `${property};ENCODING=b;TYPE=${type}:data`,
    )
  })

  it('should default to TYPE=JPEG', () => {
    const vCard = new VCard()
    vCard[method]({ image: 'data' })
    expect(vCard.toString()).toContain(`${property};ENCODING=b;TYPE=JPEG:data`)
  })

  it('should default to TYPE=JPEG when mime is undefined', () => {
    const vCard = new VCard()
    vCard[method]({ image: 'data', mime: undefined })
    expect(vCard.toString()).toContain(`${property};ENCODING=b;TYPE=JPEG:data`)
  })

  it('should default to TYPE=JPEG when mime is null', () => {
    const vCard = new VCard()
    vCard[method]({ image: 'data', mime: null as unknown as string })
    expect(vCard.toString()).toContain(`${property};ENCODING=b;TYPE=JPEG:data`)
  })

  const nonStringMimes: [string, unknown][] = [
    ['42', 42],
    ['{}', {}],
    ['true', true],
    ['[]', []],
    ["Symbol('x')", Symbol('x')],
  ]

  it.each(nonStringMimes)(
    'should throw on a non-string mime (%s)',
    (_, mime) => {
      const vCard = new VCard()
      const add = () =>
        vCard[method]({ image: 'data', mime: mime as unknown as string })
      expect(add).toThrow(VCardException)
      expect(add).toThrow(/must be strings/)
    },
  )

  it.each(['foobar', 'image/foo', 'image/', 'jpgx'])(
    "should throw on '%s'",
    (mime) => {
      const vCard = new VCard()
      expect(() => vCard[method]({ image: 'data', mime })).toThrow(
        VCardException,
      )
    },
  )

  it('should report the original value in the error', () => {
    const vCard = new VCard()
    expect(() => vCard[method]({ image: 'data', mime: 'image/foo' })).toThrow(
      '(image/foo)',
    )
  })

  it.each(['\n', '\r', '\r\n'])(
    'should throw and store nothing on control character %j in image',
    (char) => {
      const vCard = new VCard()
      expect(() =>
        vCard[method]({ image: `data${char}X-INJECTED:1`, mime: 'png' }),
      ).toThrow(VCardException)
      expect(vCard.getProperties()).toEqual([])
    },
  )
})

describe('addKey()', () => {
  it('should add a base64-encoded PGP key', () => {
    const vCard = new VCard()
    vCard.addKey({ key: 'MIICajCCAdOgAwIBAgICBEUwDQ...' })
    expect(vCard.toString()).toContain(
      'KEY;ENCODING=b;TYPE=PGP:MIICajCCAdOgAwIBAgICBEUwDQ...',
    )
  })

  it('should add a key with custom MIME type', () => {
    const vCard = new VCard()
    vCard.addKey({ key: 'base64cert', mime: 'x509' })
    expect(vCard.toString()).toContain('KEY;ENCODING=b;TYPE=X509:base64cert')
  })

  it('should add a key by URL', () => {
    const vCard = new VCard()
    vCard.addKey({ url: 'https://example.com/key.pub' })
    expect(vCard.toString()).toContain(
      'KEY;VALUE=uri:https://example.com/key.pub',
    )
  })

  it('should allow both base64 and URL keys on the same card', () => {
    const vCard = new VCard()
    vCard
      .addKey({ key: 'pgpdata' })
      .addKey({ url: 'https://example.com/key.pub' })
    const output = vCard.toString()
    expect(output).toContain('KEY;ENCODING=b;TYPE=PGP:pgpdata')
    expect(output).toContain('KEY;VALUE=uri:https://example.com/key.pub')
  })

  it('should allow multiple keys', () => {
    const vCard = new VCard()
    vCard
      .addKey({ key: 'pgpdata', mime: 'PGP' })
      .addKey({ key: 'certdata', mime: 'x509' })
    const output = vCard.toString()
    expect(output).toContain('KEY;ENCODING=b;TYPE=PGP:pgpdata')
    expect(output).toContain('KEY;ENCODING=b;TYPE=X509:certdata')
  })

  it('should write a URL with a comma and a semicolon as it is', () => {
    const vCard = new VCard()
    vCard.addKey({ url: 'https://example.com/a;b?c=1,2' })

    expect(vCard.toString()).toContain(
      'KEY;VALUE=uri:https://example.com/a;b?c=1,2',
    )
  })

  it.each(['\n', '\r'])(
    'should throw and store nothing on control character %j in url',
    (char) => {
      const vCard = new VCard()
      expect(() =>
        vCard.addKey({ url: `https://example.com/k${char}X-INJECTED:1` }),
      ).toThrow(VCardException)
      expect(vCard.getProperties()).toEqual([])
    },
  )

  it.each(['\n', '\r', '\r\n'])(
    'should throw and store nothing on control character %j in key',
    (char) => {
      const vCard = new VCard()
      expect(() => vCard.addKey({ key: `data${char}X-INJECTED:1` })).toThrow(
        VCardException,
      )
      expect(vCard.getProperties()).toEqual([])
    },
  )

  it.each(['\n', '\r', '\r\n'])(
    'should throw and store nothing on control character %j in mime',
    (char) => {
      const vCard = new VCard()
      expect(() =>
        vCard.addKey({ key: 'data', mime: `PGP${char}X-INJECTED:1` }),
      ).toThrow(VCardException)
      expect(vCard.getProperties()).toEqual([])
    },
  )

  it('should quote a mime with a semicolon', () => {
    const vCard = new VCard()
    vCard.addKey({ key: 'AAAA', mime: 'PGP;X=1' })
    expect(vCard.toString()).toContain('KEY;ENCODING=b;TYPE="PGP;X=1":AAAA')
  })

  it('should throw and store nothing on a double quote in mime', () => {
    const vCard = new VCard()
    expect(() => vCard.addKey({ key: 'AAAA', mime: 'a"b' })).toThrow(
      VCardException,
    )
    expect(vCard.getProperties()).toEqual([])
  })

  it('should throw VCardException on a non-string mime', () => {
    const vCard = new VCard()
    expect(() =>
      vCard.addKey({ key: 'AAAA', mime: 5 as unknown as string }),
    ).toThrow(VCardException)
  })
})

describe('addUid()', () => {
  it('should throw on duplicate addUid', () => {
    const vCard = new VCard()
    vCard.addUid('uid-001')
    expect(() => vCard.addUid('uid-002')).toThrow(VCardException)
  })

  it.each(['\n', '\r', '\r\n'])(
    'should throw and store nothing on control character %j in uid',
    (char) => {
      const vCard = new VCard()
      expect(() => vCard.addUid(`x${char}X-INJECTED:1`)).toThrow(VCardException)
      expect(vCard.getProperties()).toEqual([])
    },
  )
})

describe('addCategories()', () => {
  it('should throw on duplicate addCategories', () => {
    const vCard = new VCard()
    vCard.addCategories(['Work'])
    expect(() => vCard.addCategories(['Personal'])).toThrow(VCardException)
  })
})

describe('addNote()', () => {
  it('should allow multiple addNote calls', () => {
    const vCard = new VCard()
    vCard.addNote('Met at conference').addNote('Follows up quarterly')
    const output = vCard.toString()
    expect(output).toContain('NOTE:Met at conference')
    expect(output).toContain('NOTE:Follows up quarterly')
  })
})

describe('addSortString()', () => {
  it('should add ASCII sort string', () => {
    const vCard = new VCard()
    vCard.addSortString('Doe')
    expect(vCard.toString()).toContain('SORT-STRING:Doe')
  })

  it('should add CJK sort string (furigana)', () => {
    const vCard = new VCard()
    vCard.addSortString('やまだ')
    expect(vCard.toString()).toContain('SORT-STRING:やまだ')
  })

  it('should escape special characters in sort string', () => {
    const vCard = new VCard()
    vCard.addSortString('Doe, Jr.')
    expect(vCard.toString()).toContain('SORT-STRING:Doe\\, Jr.')
  })

  it('should throw on duplicate addSortString', () => {
    const vCard = new VCard()
    vCard.addSortString('Doe')
    expect(() => vCard.addSortString('Smith')).toThrow(VCardException)
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

  it('should use custom revision when set', () => {
    const vCard = new VCard()
    vCard.addRevision(new Date('2024-01-15T10:30:00Z'))
    const output = vCard.toString()
    expect(output).toContain('REV:2024-01-15T10:30:00.000Z')
    const revMatches = output.match(/REV:/g)
    expect(revMatches).toHaveLength(1)
  })

  it('should auto-generate REV when addRevision not called', () => {
    const vCard = new VCard()
    vCard.addName({ givenName: 'John' })
    expect(vCard.toString()).toContain('REV:2026-01-01T00:00:00.000Z')
  })

  it.each([
    ['+010000-01-01T00:00:00Z', 10000],
    ['-000001-01-01T00:00:00Z', -1],
  ])('should throw and store nothing on a Date in year %s', (iso, year) => {
    const vCard = new VCard()
    expect(() => vCard.addRevision(new Date(iso))).toThrow(
      `Invalid revision: the year must be 0000 to 9999 (got ${year})`,
    )
    expect(vCard.getProperties()).toEqual([])
  })

  it('should throw on duplicate addRevision', () => {
    const vCard = new VCard()
    vCard.addRevision(new Date('2024-01-15T10:30:00Z'))
    expect(() => vCard.addRevision(new Date('2024-02-01T00:00:00Z'))).toThrow(
      VCardException,
    )
  })
})

describe('addCustomProperty()', () => {
  it('should add a basic custom property', () => {
    const vCard = new VCard()
    vCard.addCustomProperty({ name: 'X-PHONETIC-FIRST-NAME', value: 'Jon' })
    expect(vCard.toString()).toContain('X-PHONETIC-FIRST-NAME:Jon')
  })

  it('should add custom property with params', () => {
    const vCard = new VCard()
    vCard.addCustomProperty({
      name: 'X-CUSTOM',
      value: 'value',
      params: 'TYPE=work',
    })
    expect(vCard.toString()).toContain('X-CUSTOM;TYPE=work:value')
  })

  it('should allow multiple custom properties', () => {
    const vCard = new VCard()
    vCard
      .addCustomProperty({ name: 'X-PHONETIC-FIRST-NAME', value: 'Jon' })
      .addCustomProperty({ name: 'X-PHONETIC-LAST-NAME', value: 'Sumisu' })
      .addCustomProperty({ name: 'X-ANNIVERSARY', value: '2010-06-15' })
    const output = vCard.toString()
    expect(output).toContain('X-PHONETIC-FIRST-NAME:Jon')
    expect(output).toContain('X-PHONETIC-LAST-NAME:Sumisu')
    expect(output).toContain('X-ANNIVERSARY:2010-06-15')
  })

  it('should uppercase the property name', () => {
    const vCard = new VCard()
    vCard.addCustomProperty({ name: 'x-custom-field', value: 'test' })
    expect(vCard.toString()).toContain('X-CUSTOM-FIELD:test')
  })

  it('should handle empty value', () => {
    const vCard = new VCard()
    vCard.addCustomProperty({ name: 'X-EMPTY', value: '' })
    expect(vCard.toString()).toContain('X-EMPTY:')
  })

  it('should handle empty params', () => {
    const vCard = new VCard()
    vCard.addCustomProperty({ name: 'X-TEST', value: 'value', params: '' })
    const output = vCard.toString()
    expect(output).toContain('X-TEST:value')
    expect(output).not.toContain('X-TEST;')
  })

  it('should NOT escape values (escape hatch)', () => {
    const vCard = new VCard()
    vCard.addCustomProperty({ name: 'X-TEST', value: 'a;b,c\\d' })
    expect(vCard.toString()).toContain('X-TEST:a;b,c\\d')
  })

  it('should write a tab in value and params as it is', () => {
    const vCard = new VCard()
    vCard.addCustomProperty({
      name: 'X-TEST',
      value: 'a\tb',
      params: 'X-P="c\td"',
    })
    expect(vCard.toString()).toContain('X-TEST;X-P="c\td":a\tb')
  })

  it.each(['name', 'value', 'params', 'group'] as const)(
    'should throw and store nothing on a line break in %s',
    (field) => {
      for (const char of ['\n', '\r', '\r\n']) {
        const vCard = new VCard()
        const options = {
          name: 'X-TEST',
          value: 'value',
          params: 'TYPE=work',
          group: 'item1',
          [field]: `x${char}X-INJECTED:1`,
        }
        expect(() => vCard.addCustomProperty(options)).toThrow(VCardException)
        expect(vCard.getProperties()).toEqual([])
      }
    },
  )

  it.each(['name', 'group'] as const)(
    'should throw on a tab in %s',
    (field) => {
      const vCard = new VCard()
      expect(() =>
        vCard.addCustomProperty({
          name: 'X-TEST',
          value: 'v',
          [field]: 'a\tb',
        }),
      ).toThrow(VCardException)
    },
  )

  it.each(['X:A', '', 'X.A'])(
    'should throw and store nothing on name %j',
    (name) => {
      const vCard = new VCard()
      expect(() => vCard.addCustomProperty({ name, value: 'a' })).toThrow(
        VCardException,
      )
      expect(vCard.getProperties()).toEqual([])
    },
  )

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

  it.each(['item.1', 'a:b'])(
    'should throw and store nothing on group %j',
    (group) => {
      const vCard = new VCard()
      expect(() =>
        vCard.addCustomProperty({ name: 'TEL', value: 'a', group }),
      ).toThrow(VCardException)
      expect(vCard.getProperties()).toEqual([])
    },
  )
})

describe('Property grouping', () => {
  it('should write no prefix for an empty group', () => {
    const vCard = new VCard()
    vCard.addCustomProperty({ name: 'X-TEST', value: 'value', group: '' })
    const output = vCard.toString()
    expect(output).toContain('\r\nX-TEST:value')
    expect(output).not.toContain('.X-TEST')
  })

  it('should prefix grouped custom properties', () => {
    const vCard = new VCard()
    vCard.addCustomProperty({
      name: 'TEL',
      value: '+1-555-1234',
      group: 'item1',
    })
    expect(vCard.toString()).toContain('item1.TEL:+1-555-1234')
  })

  it('should support multiple grouped properties with same prefix', () => {
    const vCard = new VCard()
    vCard
      .addCustomProperty({
        name: 'TEL',
        value: '+1-555-1234',
        group: 'item1',
      })
      .addCustomProperty({
        name: 'X-ABLabel',
        value: 'Work Phone',
        group: 'item1',
      })
    const output = vCard.toString()
    expect(output).toContain('item1.TEL:+1-555-1234')
    expect(output).toContain('item1.X-ABLABEL:Work Phone')
  })

  it('should not prefix ungrouped properties', () => {
    const vCard = new VCard()
    vCard.addCustomProperty({ name: 'X-TEST', value: 'value' })
    const output = vCard.toString()
    expect(output).toContain('X-TEST:value')
    expect(output).not.toContain('.X-TEST')
  })
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
    // Covered by the addGeo() tests
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
    const methods = Object.getOwnPropertyNames(VCard.prototype).filter(
      (name) =>
        name.startsWith('add') &&
        name !== 'addMediaUrl' &&
        name !== 'addMediaContent',
    )

    expect(Object.keys(required).sort()).toEqual(methods.sort())
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
