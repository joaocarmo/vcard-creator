import { vi } from 'vitest'
import VCard from './VCard'
import VCardException from './VCardException'

describe('Test addFullName()', () => {
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

  it('should escape special characters', () => {
    const vCard = new VCard()
    vCard.addFullName('Smith, John; Jr.')
    expect(vCard.toString()).toContain('FN:Smith\\, John\\; Jr.')
  })

  it('should prevent duplicate FN with non-default charset', () => {
    const vCard = new VCard()
    vCard.setCharset('iso-8859-1')
    vCard.addFullName('Custom Name')
    vCard.addName({ givenName: 'John', familyName: 'Doe' })
    const output = vCard.toString()
    const fnMatches = output.match(/FN/g)
    expect(fnMatches).toHaveLength(1)
    expect(output).toContain('FN;CHARSET=iso-8859-1:Custom Name')
  })
})

describe('Multiple nickname instances', () => {
  it('should allow multiple addNickname calls', () => {
    const vCard = new VCard()
    vCard.addNickname('Johnny').addNickname('JD')
    const output = vCard.toString()
    expect(output).toContain('NICKNAME:Johnny')
    expect(output).toContain('NICKNAME:JD')
  })
})

describe('Test addKey()', () => {
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
})

describe('Multiple note instances', () => {
  it('should allow multiple addNote calls', () => {
    const vCard = new VCard()
    vCard.addNote('Met at conference').addNote('Follows up quarterly')
    const output = vCard.toString()
    expect(output).toContain('NOTE:Met at conference')
    expect(output).toContain('NOTE:Follows up quarterly')
  })
})

describe('Test addGeo()', () => {
  it('should add geographic position', () => {
    const vCard = new VCard()
    vCard.addGeo({ latitude: 37.386013, longitude: -122.082932 })
    const output = vCard.toString()
    expect(output).toContain('GEO:37.386013;-122.082932')
  })

  it('should accept boundary values', () => {
    const vCard = new VCard()
    vCard.addGeo({ latitude: -90, longitude: 180 })
    const output = vCard.toString()
    expect(output).toContain('GEO:-90;180')
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

  it('should throw on duplicate addGeo', () => {
    const vCard = new VCard()
    vCard.addGeo({ latitude: 37, longitude: -122 })
    expect(() => vCard.addGeo({ latitude: 40, longitude: -74 })).toThrow(
      VCardException,
    )
  })
})

describe('Test addTimezone()', () => {
  it('should add UTC offset timezone', () => {
    const vCard = new VCard()
    vCard.addTimezone('-05:00')
    expect(vCard.toString()).toContain('TZ:-05:00')
  })

  it('should add IANA timezone name', () => {
    const vCard = new VCard()
    vCard.addTimezone('America/New_York')
    expect(vCard.toString()).toContain('TZ:America/New_York')
  })

  it('should throw on duplicate addTimezone', () => {
    const vCard = new VCard()
    vCard.addTimezone('-05:00')
    expect(() => vCard.addTimezone('+09:00')).toThrow(VCardException)
  })
})

describe('Test addSortString()', () => {
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

  it('should throw on duplicate addSortString', () => {
    const vCard = new VCard()
    vCard.addSortString('Doe')
    expect(() => vCard.addSortString('Smith')).toThrow(VCardException)
  })

  it('should escape special characters in sort string', () => {
    const vCard = new VCard()
    vCard.addSortString('Doe, Jr.')
    expect(vCard.toString()).toContain('SORT-STRING:Doe\\, Jr.')
  })
})

describe('Test addLabel()', () => {
  it('should add label with default type', () => {
    const vCard = new VCard()
    vCard.addLabel({ label: '123 Main St\nSpringfield, IL 62701' })
    const output = vCard.toString()
    expect(output).toContain('LABEL;TYPE=WORK,POSTAL:')
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

  it('should allow multiple labels', () => {
    const vCard = new VCard()
    vCard.addLabel({ label: 'Work address', type: ['work'] })
    vCard.addLabel({ label: 'Home address', type: ['home'] })
    const output = vCard.toString()
    expect(output).toContain('LABEL;TYPE=WORK:Work address')
    expect(output).toContain('LABEL;TYPE=HOME:Home address')
  })

  it('should escape semicolons and commas in label', () => {
    const vCard = new VCard()
    vCard.addLabel({ label: 'Floor 2; Suite 5, Room A' })
    expect(vCard.toString()).toContain('Floor 2\\; Suite 5\\, Room A')
  })
})

describe('Test addBirthday()', () => {
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

    const props1 = vCard1.getProperties()
    const props2 = vCard2.getProperties()
    const bday1 = props1.find((p) => p.key === 'BDAY')
    const bday2 = props2.find((p) => p.key === 'BDAY')
    expect(bday1?.value).toBe(bday2?.value)
  })

  it('should throw on duplicate addBirthday', () => {
    const vCard = new VCard()
    vCard.addBirthday('1990-05-15')
    expect(() => vCard.addBirthday('1991-06-20')).toThrow(VCardException)
  })
})

describe('Test addRevision()', () => {
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
    // Should NOT have auto-generated REV
    const revMatches = output.match(/REV:/g)
    expect(revMatches).toHaveLength(1)
  })

  it('should auto-generate REV when addRevision not called', () => {
    const vCard = new VCard()
    vCard.addName({ givenName: 'John' })
    const output = vCard.toString()
    expect(output).toContain('REV:2026-01-01T00:00:00.000Z')
  })

  it('should throw on duplicate addRevision', () => {
    const vCard = new VCard()
    vCard.addRevision(new Date('2024-01-15T10:30:00Z'))
    expect(() => vCard.addRevision(new Date('2024-02-01T00:00:00Z'))).toThrow(
      VCardException,
    )
  })
})

describe('Test addCustomProperty()', () => {
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
})

describe('Property grouping', () => {
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

describe('Social & IMPP', () => {
  it('should output both X-SOCIALPROFILE and IMPP for social profiles', () => {
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

  it('should handle social profiles without type or user', () => {
    const vCard = new VCard()
    vCard.addSocial({ url: 'https://example.com/profile', type: '' })

    const output = vCard.toString()

    expect(output).toContain('X-SOCIALPROFILE:https://example.com/profile')
    expect(output).toContain('IMPP:https://example.com/profile')
    expect(output).not.toContain('X-SERVICE-TYPE')
    expect(output).not.toContain('x-user')
  })

  it('should support multiple social profiles', () => {
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

  it('should add standalone IMPP with service type', () => {
    const vCard = new VCard()
    vCard.addImpp({ uri: 'xmpp:user@example.com', serviceType: 'XMPP' })

    const output = vCard.toString()

    expect(output).toContain('IMPP;X-SERVICE-TYPE=XMPP:xmpp:user@example.com')
    expect(output).not.toContain('X-SOCIALPROFILE')
  })

  it('should add standalone IMPP without service type', () => {
    const vCard = new VCard()
    vCard.addImpp({ uri: 'sip:user@example.com' })

    const output = vCard.toString()

    expect(output).toContain('IMPP:sip:user@example.com')
    expect(output).not.toContain('X-SERVICE-TYPE')
  })

  it('should support multiple IMPP entries', () => {
    const vCard = new VCard()
    vCard
      .addImpp({ uri: 'xmpp:user@example.com', serviceType: 'XMPP' })
      .addImpp({ uri: 'sip:user@example.com', serviceType: 'SIP' })

    const output = vCard.toString()

    expect(output).toContain('IMPP;X-SERVICE-TYPE=XMPP:xmpp:user@example.com')
    expect(output).toContain('IMPP;X-SERVICE-TYPE=SIP:sip:user@example.com')
  })
})

describe('Multiple photo/logo instances', () => {
  it('should allow both base64 and URL photo on the same card', () => {
    const vCard = new VCard()
    vCard
      .addPhoto({ image: 'base64data', mime: 'jpeg' })
      .addPhoto({ url: 'https://example.com/photo.jpg' })

    const output = vCard.toString()
    expect(output).toContain('PHOTO;ENCODING=b;TYPE=JPEG:base64data')
    expect(output).toContain('PHOTO;VALUE=uri:https://example.com/photo.jpg')
  })

  it('should allow both base64 and URL logo on the same card', () => {
    const vCard = new VCard()
    vCard
      .addLogo({ image: 'base64logo', mime: 'png' })
      .addLogo({ url: 'https://example.com/logo.png' })

    const output = vCard.toString()
    expect(output).toContain('LOGO;ENCODING=b;TYPE=PNG:base64logo')
    expect(output).toContain('LOGO;VALUE=uri:https://example.com/logo.png')
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
})
