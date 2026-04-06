import { vi } from 'vitest'
import VCard from './VCard'
import VCardException from './VCardException'
import { fold, resolveType } from './utils/functions'
import { LIB_VERSION } from './utils/constants'

describe('Test vCard', () => {
  const photoURL = 'https://example.com/img/photo.jpg'

  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date())
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should create and output the proper vCard format', () => {
    const vCard = new VCard()

    vCard
      .addName({ familyName: 'Desloovere', givenName: 'Jeroen' })
      .addNickname(['Jero', 'Jerox'])
      .addSocial({
        url: 'https://x.com/desloovere_j',
        type: 'X',
        user: 'desloovere_j',
      })
      .addCompany({ name: 'Siesqo' })
      .addJobtitle('Web Developer')
      .addRole('Data Protection Officer')
      .addEmail({ address: 'info@jeroendesloovere.be' })
      .addPhoneNumber({ number: 1234121212, type: ['pref', 'work'] })
      .addPhoneNumber({ number: 123456789, type: ['work'] })
      .addAddress({
        postOfficeBox: 'name',
        extended: 'extended',
        street: 'street',
        locality: 'worktown',
        region: 'state',
        postalCode: 'workpostcode',
        country: 'Belgium',
      })
      .addUrl({ url: 'http://www.jeroendesloovere.be' })
      .addPhotoUrl({ url: photoURL })
      .addUid('19950401-080045-40000F192713-0052')

    const vCardOutput = vCard.toString()
    const expectedOutput = `\
BEGIN:VCARD\r\n\
VERSION:3.0\r\n\
PRODID:-//vcard-creator//vcard-creator ${LIB_VERSION}//EN\r\n\
REV:${new Date().toISOString()}\r\n\
N:Desloovere;Jeroen;;;\r\n\
FN:Jeroen Desloovere\r\n\
NICKNAME:Jero,Jerox\r\n\
X-SOCIALPROFILE;type=X;x-user=desloovere_j:https://x.com/desloovere_j\r\n\
IMPP;X-SERVICE-TYPE=X:https://x.com/desloovere_j\r\n\
ORG:Siesqo\r\n\
TITLE:Web Developer\r\n\
ROLE:Data Protection Officer\r\n\
EMAIL:info@jeroendesloovere.be\r\n\
TEL;TYPE=PREF,WORK:1234121212\r\n\
TEL;TYPE=WORK:123456789\r\n\
ADR;TYPE=WORK,POSTAL:name;extended;street;worktown;state;workpostcode;Belgi\r\n um\r\n\
URL:http://www.jeroendesloovere.be\r\n\
PHOTO;VALUE=uri:https://example.com/img/photo.jpg\r\n\
UID:19950401-080045-40000F192713-0052\r\n\
END:VCARD\r\n\
`

    expect(vCardOutput).toBe(expectedOutput)
  })

  it('should throw on attempting to add the same property', () => {
    const vCard = new VCard()

    vCard.addName({ familyName: 'Desloovere', givenName: 'Jeroen' })

    expect(() => {
      vCard.addName({ familyName: 'Desloovere', givenName: 'Jeroen' })
    }).toThrow(VCardException)
  })

  it('should throw on attempting to add an invalid MIME Media Type', () => {
    const vCard = new VCard()

    expect(() => {
      vCard.addPhoto({
        image: 'MIICajCCAdOgAwIBAgICBEUwDQYJKoZIhvcN...',
        mime: 'foobar',
      })
    }).toThrow(VCardException)
  })

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

  it('should parse phone numbers correctly', () => {
    const vCard = new VCard()

    vCard
      .addPhoneNumber({ number: 1234121212, type: ['pref', 'work'] })
      .addPhoneNumber({ number: 123456789, type: ['work'] })
      .addPhoneNumber({ number: '0123456789', type: ['home'] })

    const vCardOutput = vCard.toString()
    const expectedOutput = `\
BEGIN:VCARD\r\n\
VERSION:3.0\r\n\
PRODID:-//vcard-creator//vcard-creator ${LIB_VERSION}//EN\r\n\
REV:${new Date().toISOString()}\r\n\
TEL;TYPE=PREF,WORK:1234121212\r\n\
TEL;TYPE=WORK:123456789\r\n\
TEL;TYPE=HOME:0123456789\r\n\
END:VCARD\r\n\
`

    expect(vCardOutput).toBe(expectedOutput)
  })
})

describe('Test fold()', () => {
  it('should not fold lines under 75 octets', () => {
    const short = 'TEL;TYPE=WORK:+1-555-0100\r\n'
    expect(fold(short)).toBe(short)
  })

  it('should fold ASCII lines over 75 octets', () => {
    const long = 'A'.repeat(80) + '\r\n'
    const result = fold(long)
    expect(result).toContain('\r\n ')
    const lines = result.split('\r\n ')
    const encoder = new TextEncoder()
    expect(encoder.encode(lines[0]).length).toBeLessThanOrEqual(75)
  })

  it('should fold CJK text at octet boundaries without splitting characters', () => {
    const exactly75 = '漢'.repeat(25)
    expect(fold(exactly75)).toBe(exactly75)

    const exactly75WithCrlf = '漢'.repeat(25) + '\r\n'
    expect(fold(exactly75WithCrlf)).toBe(exactly75WithCrlf)

    const over75 = '漢'.repeat(26)
    const result = fold(over75)
    expect(result).toContain('\r\n ')
    const charCount = (result.match(/漢/g) || []).length
    expect(charCount).toBe(26)
  })

  it('should fold emoji without splitting multi-byte sequences', () => {
    const under = '😀'.repeat(18) + '\r\n'
    expect(fold(under)).toBe(under)

    const over = '😀'.repeat(19) + '\r\n'
    const result = fold(over)
    expect(result).toContain('\r\n ')
    const emojiCount = (result.match(/😀/g) || []).length
    expect(emojiCount).toBe(19)
  })

  it('should fold mixed ASCII and multi-byte text correctly', () => {
    const mixed = 'A'.repeat(60) + '漢'.repeat(6)
    const result = fold(mixed)
    expect(result).toContain('\r\n ')
    const aCount = (result.match(/A/g) || []).length
    const cjkCount = (result.match(/漢/g) || []).length
    expect(aCount).toBe(60)
    expect(cjkCount).toBe(6)
  })

  it('should handle exactly 75 octets without folding', () => {
    const exact = 'X'.repeat(75)
    expect(fold(exact)).toBe(exact)
  })

  it('should handle 76 octets by folding', () => {
    const oneOver = 'X'.repeat(76)
    const result = fold(oneOver)
    expect(result).toContain('\r\n ')
  })
})

describe('Test addGeo()', () => {
  it('should add geographic position', () => {
    const vCard = new VCard()
    vCard.addGeo(37.386013, -122.082932)
    const output = vCard.toString()
    expect(output).toContain('GEO:37.386013;-122.082932')
  })

  it('should accept boundary values', () => {
    const vCard = new VCard()
    vCard.addGeo(-90, 180)
    const output = vCard.toString()
    expect(output).toContain('GEO:-90;180')
  })

  it('should throw on invalid latitude', () => {
    const vCard = new VCard()
    expect(() => vCard.addGeo(91, 0)).toThrow(VCardException)
    expect(() => vCard.addGeo(-91, 0)).toThrow(VCardException)
  })

  it('should throw on invalid longitude', () => {
    const vCard = new VCard()
    expect(() => vCard.addGeo(0, 181)).toThrow(VCardException)
    expect(() => vCard.addGeo(0, -181)).toThrow(VCardException)
  })

  it('should throw on duplicate addGeo', () => {
    const vCard = new VCard()
    vCard.addGeo(37, -122)
    expect(() => vCard.addGeo(40, -74)).toThrow(VCardException)
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

describe('Test PRODID', () => {
  it('should include PRODID in every vCard output', () => {
    const vCard = new VCard()
    vCard.addName({ familyName: 'Doe', givenName: 'John' })
    const output = vCard.toString()
    expect(output).toContain(
      `PRODID:-//vcard-creator//vcard-creator ${LIB_VERSION}//EN`,
    )
  })

  it('should place PRODID after VERSION and before REV', () => {
    const vCard = new VCard()
    vCard.addName({ familyName: 'Doe', givenName: 'John' })
    const output = vCard.toString()
    const versionIdx = output.indexOf('VERSION:3.0')
    const prodidIdx = output.indexOf('PRODID:')
    const revIdx = output.indexOf('REV:')
    expect(prodidIdx).toBeGreaterThan(versionIdx)
    expect(prodidIdx).toBeLessThan(revIdx)
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

describe('Object params API', () => {
  it('addName with options object', () => {
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

  it('addAddress with options and typed array', () => {
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

  it('addAddress with default type', () => {
    const vCard = new VCard()
    vCard.addAddress({ street: '123 Main St' })
    expect(vCard.toString()).toContain('ADR;TYPE=WORK,POSTAL:')
  })

  it('addEmail with options and typed array', () => {
    const vCard = new VCard()
    vCard.addEmail({ address: 'john@example.com', type: ['pref', 'work'] })
    expect(vCard.toString()).toContain('EMAIL;TYPE=PREF,WORK:john@example.com')
  })

  it('addEmail with options, no type', () => {
    const vCard = new VCard()
    vCard.addEmail({ address: 'john@example.com' })
    expect(vCard.toString()).toContain('EMAIL:john@example.com')
  })

  it('addPhoneNumber with options and typed array', () => {
    const vCard = new VCard()
    vCard.addPhoneNumber({ number: '+1-555-0100', type: ['cell'] })
    expect(vCard.toString()).toContain('TEL;TYPE=CELL:+1-555-0100')
  })

  it('addPhoneNumber with options, numeric', () => {
    const vCard = new VCard()
    vCard.addPhoneNumber({ number: 1234567890 })
    expect(vCard.toString()).toContain('TEL:1234567890')
  })

  it('addCompany with options', () => {
    const vCard = new VCard()
    vCard.addCompany({ name: 'Acme Corp', department: 'Engineering' })
    expect(vCard.toString()).toContain('ORG:Acme Corp;Engineering')
  })

  it('addUrl with options and typed array', () => {
    const vCard = new VCard()
    vCard.addUrl({ url: 'https://example.com', type: ['work'] })
    expect(vCard.toString()).toContain('URL;TYPE=WORK:https://example.com')
  })

  it('addSocial with options', () => {
    const vCard = new VCard()
    vCard.addSocial({ url: 'https://x.com/jdoe', type: 'X', user: 'jdoe' })
    const output = vCard.toString()
    expect(output).toContain(
      'X-SOCIALPROFILE;type=X;x-user=jdoe:https://x.com/jdoe',
    )
    expect(output).toContain('IMPP;X-SERVICE-TYPE=X:https://x.com/jdoe')
  })

  it('addImpp with options', () => {
    const vCard = new VCard()
    vCard.addImpp({ uri: 'xmpp:user@example.com', serviceType: 'XMPP' })
    expect(vCard.toString()).toContain(
      'IMPP;X-SERVICE-TYPE=XMPP:xmpp:user@example.com',
    )
  })

  it('addPhotoUrl with options', () => {
    const vCard = new VCard()
    vCard.addPhotoUrl({ url: 'https://example.com/photo.jpg' })
    expect(vCard.toString()).toContain(
      'PHOTO;VALUE=uri:https://example.com/photo.jpg',
    )
  })

  it('addLogoUrl with options', () => {
    const vCard = new VCard()
    vCard.addLogoUrl({ url: 'https://example.com/logo.png' })
    expect(vCard.toString()).toContain(
      'LOGO;VALUE=uri:https://example.com/logo.png',
    )
  })

  it('addPhoto with options', () => {
    const vCard = new VCard()
    vCard.addPhoto({ image: 'base64data', mime: 'png' })
    expect(vCard.toString()).toContain('PHOTO;ENCODING=b;TYPE=PNG:base64data')
  })

  it('addLogo with options', () => {
    const vCard = new VCard()
    vCard.addLogo({ image: 'base64data', mime: 'jpeg' })
    expect(vCard.toString()).toContain('LOGO;ENCODING=b;TYPE=JPEG:base64data')
  })

  it('addLabel with options and typed array', () => {
    const vCard = new VCard()
    vCard.addLabel({ label: '123 Main St\nSpringfield', type: ['home'] })
    expect(vCard.toString()).toContain(
      'LABEL;TYPE=HOME:123 Main St\\nSpringfield',
    )
  })

  it('addLabel with options, default type', () => {
    const vCard = new VCard()
    vCard.addLabel({ label: 'Work address' })
    expect(vCard.toString()).toContain('LABEL;TYPE=WORK,POSTAL:Work address')
  })
})

describe('resolveType wire format', () => {
  it('typed array produces TYPE= format', () => {
    const vCard = new VCard()
    vCard.addPhoneNumber({ number: '123', type: ['work', 'voice'] })
    expect(vCard.toString()).toContain('TEL;TYPE=WORK,VOICE:123')
  })

  it('empty type produces no TYPE parameter', () => {
    const vCard = new VCard()
    vCard.addEmail({ address: 'test@test.com' })
    const output = vCard.toString()
    expect(output).toContain('EMAIL:test@test.com')
    expect(output).not.toContain('TYPE=')
  })

  it('empty array produces no TYPE parameter', () => {
    const vCard = new VCard()
    vCard.addAddress({ street: 'Main St', type: [] })
    expect(vCard.toString()).toContain('ADR:')
    expect(vCard.toString()).not.toContain('TYPE=')
  })

  it('resolveType with single element', () => {
    expect(resolveType(['work'])).toBe('TYPE=WORK')
  })

  it('resolveType with multiple elements', () => {
    expect(resolveType(['work', 'postal'])).toBe('TYPE=WORK,POSTAL')
  })

  it('resolveType with empty array', () => {
    expect(resolveType([])).toBe('')
  })
})

describe('Metadata getters', () => {
  it('should return default content type', () => {
    const vCard = new VCard()
    expect(vCard.getContentType()).toBe('text/x-vcard')
  })

  it('should return default filename', () => {
    const vCard = new VCard()
    expect(vCard.getFilename()).toBe('vcard')
  })

  it('should return default file extension', () => {
    const vCard = new VCard()
    expect(vCard.getFileExtension()).toBe('vcf')
  })

  it('should return default charset', () => {
    const vCard = new VCard()
    expect(vCard.getCharset()).toBe('utf-8')
  })

  it('should allow setting a custom filename', () => {
    const vCard = new VCard()
    vCard.setFilename('contact')
    expect(vCard.getFilename()).toBe('contact')
  })

  it('should ignore empty filename', () => {
    const vCard = new VCard()
    vCard.setFilename('')
    expect(vCard.getFilename()).toBe('vcard')
  })
})

describe('hasProperty()', () => {
  it('should return true for a property with a value', () => {
    const vCard = new VCard()
    vCard.addEmail({ address: 'test@test.com' })
    expect(vCard.hasProperty('EMAIL')).toBe(true)
  })

  it('should return true for a property with an empty value', () => {
    const vCard = new VCard()
    vCard.addCustomProperty({ name: 'X-EMPTY', value: '' })
    expect(vCard.hasProperty('X-EMPTY')).toBe(true)
  })

  it('should return false for a non-existent property', () => {
    const vCard = new VCard()
    expect(vCard.hasProperty('EMAIL')).toBe(false)
  })
})

describe('CHARSET handling', () => {
  it('should not add CHARSET for default utf-8', () => {
    const vCard = new VCard()
    vCard.addName({ familyName: 'Doe', givenName: 'John' })
    const output = vCard.toString()
    expect(output).toContain('N:Doe;John;;;')
    expect(output).not.toContain('CHARSET')
  })

  it('should add CHARSET for non-default charset', () => {
    const vCard = new VCard()
    vCard.setCharset('iso-8859-1')
    vCard.addName({ familyName: 'Doe', givenName: 'John' })
    const output = vCard.toString()
    expect(output).toContain('N;CHARSET=iso-8859-1:Doe;John;;;')
  })

  it('should add CHARSET to all text properties for non-default charset', () => {
    const vCard = new VCard()
    vCard.setCharset('iso-8859-1')
    vCard.addName({ givenName: 'John', familyName: 'Doe' })
    vCard.addNickname('JD')
    vCard.addCompany({ name: 'Acme' })
    vCard.addJobtitle('Dev')
    vCard.addRole('Engineer')
    vCard.addNote('A note')
    vCard.addCategories(['Work'])
    vCard.addSortString('Doe')
    vCard.addAddress({ street: '123 Main' })
    vCard.addLabel({ label: 'Home' })
    const output = vCard.toString()
    expect(output).toContain('N;CHARSET=iso-8859-1:Doe;John;;;')
    expect(output).toContain('FN;CHARSET=iso-8859-1:John Doe')
    expect(output).toContain('NICKNAME;CHARSET=iso-8859-1:JD')
    expect(output).toContain('ORG;CHARSET=iso-8859-1:Acme')
    expect(output).toContain('TITLE;CHARSET=iso-8859-1:Dev')
    expect(output).toContain('ROLE;CHARSET=iso-8859-1:Engineer')
    expect(output).toContain('NOTE;CHARSET=iso-8859-1:A note')
    expect(output).toContain('CATEGORIES;CHARSET=iso-8859-1:Work')
    expect(output).toContain('SORT-STRING;CHARSET=iso-8859-1:Doe')
    expect(output).toContain('ADR;TYPE=WORK,POSTAL;CHARSET=iso-8859-1:')
    expect(output).toContain('LABEL;TYPE=WORK,POSTAL;CHARSET=iso-8859-1:Home')
  })
})

describe('Text escaping', () => {
  describe('structured values', () => {
    it('should escape semicolons in address components', () => {
      const vCard = new VCard()
      vCard.addAddress({ street: '123 Main; Suite 5' })
      expect(vCard.toString()).toContain('123 Main\\; Suite 5')
    })

    it('should escape commas in address components', () => {
      const vCard = new VCard()
      vCard.addAddress({ locality: 'Springfield, IL' })
      expect(vCard.toString()).toContain('Springfield\\, IL')
    })

    it('should escape commas in family name', () => {
      const vCard = new VCard()
      vCard.addName({ familyName: 'Smith, Jr.', givenName: 'John' })
      const output = vCard.toString()
      expect(output).toContain('N:Smith\\, Jr.;John;;;')
      expect(output).toContain('FN:John Smith\\, Jr.')
    })

    it('should escape backslashes in name components', () => {
      const vCard = new VCard()
      vCard.addName({ familyName: 'O\\Brien' })
      expect(vCard.toString()).toContain('N:O\\\\Brien;;;;')
    })

    it('should escape semicolons in company name', () => {
      const vCard = new VCard()
      vCard.addCompany({ name: 'Foo; Bar Inc' })
      expect(vCard.toString()).toContain('ORG:Foo\\; Bar Inc')
    })

    it('should escape semicolons in company department', () => {
      const vCard = new VCard()
      vCard.addCompany({ name: 'Acme', department: 'R;D' })
      expect(vCard.toString()).toContain('ORG:Acme;R\\;D')
    })
  })

  describe('list values', () => {
    it('should escape commas in nickname array elements', () => {
      const vCard = new VCard()
      vCard.addNickname(['Nick,name', 'Other'])
      expect(vCard.toString()).toContain('NICKNAME:Nick\\,name,Other')
    })

    it('should escape commas in single nickname string', () => {
      const vCard = new VCard()
      vCard.addNickname('Nick,name')
      expect(vCard.toString()).toContain('NICKNAME:Nick\\,name')
    })

    it('should escape commas in categories', () => {
      const vCard = new VCard()
      vCard.addCategories(['Rock, Pop', 'Jazz'])
      expect(vCard.toString()).toContain('CATEGORIES:Rock\\, Pop,Jazz')
    })
  })

  describe('simple text values', () => {
    it('should escape special characters in note', () => {
      const vCard = new VCard()
      vCard.addNote('Call me; available, Mon\\Fri\nLeave message')
      expect(vCard.toString()).toContain(
        'NOTE:Call me\\; available\\, Mon\\\\Fri\\nLeave message',
      )
    })

    it('should escape special characters in jobtitle', () => {
      const vCard = new VCard()
      vCard.addJobtitle('VP; Sales, Marketing')
      expect(vCard.toString()).toContain('TITLE:VP\\; Sales\\, Marketing')
    })

    it('should escape special characters in role', () => {
      const vCard = new VCard()
      vCard.addRole('Manager; Team Lead')
      expect(vCard.toString()).toContain('ROLE:Manager\\; Team Lead')
    })
  })

  describe('non-escaped values', () => {
    it('should not escape URL values', () => {
      const vCard = new VCard()
      vCard.addUrl({ url: 'https://example.com/path;param?a=1,2' })
      expect(vCard.toString()).toContain(
        'URL:https://example.com/path;param?a=1,2',
      )
    })

    it('should not escape email values', () => {
      const vCard = new VCard()
      vCard.addEmail({ address: 'user@example.com' })
      expect(vCard.toString()).toContain('EMAIL:user@example.com')
    })

    it('should not escape phone number values', () => {
      const vCard = new VCard()
      vCard.addPhoneNumber({ number: '+1-555-0100' })
      expect(vCard.toString()).toContain('TEL:+1-555-0100')
    })

    it('should not escape GEO structural semicolons', () => {
      const vCard = new VCard()
      vCard.addGeo(37.386, -122.083)
      expect(vCard.toString()).toContain('GEO:37.386;-122.083')
    })

    it('should not escape custom property values', () => {
      const vCard = new VCard()
      vCard.addCustomProperty({ name: 'X-TEST', value: 'a;b,c\\d' })
      expect(vCard.toString()).toContain('X-TEST:a;b,c\\d')
    })
  })
})

describe('Empty FN guard', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date())
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should not generate FN when all name components are empty', () => {
    const vCard = new VCard()
    vCard.addName({})
    const output = vCard.toString()
    expect(output).toContain('N:;;;;')
    expect(output).not.toContain('FN:')
  })

  it('should still generate FN when name has components', () => {
    const vCard = new VCard()
    vCard.addName({ givenName: 'John' })
    const output = vCard.toString()
    expect(output).toContain('FN:John')
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

describe('Full chain with object API', () => {
  it('should produce valid vCard output with all object params', () => {
    const vCard = new VCard()
    vCard
      .addName({ givenName: 'John', familyName: 'Doe' })
      .addCompany({ name: 'Acme' })
      .addEmail({ address: 'john@acme.com', type: ['work'] })
      .addPhoneNumber({ number: '+1555', type: ['cell'] })
      .addAddress({ street: '123 Main', locality: 'NYC', type: ['work'] })
      .addUrl({ url: 'https://acme.com' })

    const output = vCard.toString()
    expect(output).toContain('BEGIN:VCARD')
    expect(output).toContain('N:Doe;John;;;')
    expect(output).toContain('EMAIL;TYPE=WORK:john@acme.com')
    expect(output).toContain('TEL;TYPE=CELL:+1555')
    expect(output).toContain('ADR;TYPE=WORK:')
    expect(output).toContain('URL:https://acme.com')
    expect(output).toContain('END:VCARD')
  })
})
