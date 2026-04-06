import { vi } from 'vitest'
import VCard from './VCard'
import VCardException from './VCardException'
import { b64encode, chunkSplit, fold } from './utils/functions'
import { LIB_VERSION } from './utils/constants'

describe('Test vCard', () => {
  // Define variables
  const lastname = 'Desloovere'
  const firstname = 'Jeroen'
  const additional = ''
  const prefix = ''
  const suffix = ''
  const photoURL = 'https://example.com/img/photo.jpg'

  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date())
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it("should create and output the proper 'vcard' format", () => {
    // Define vCard
    const vCard = new VCard()

    vCard
      // Add personal data
      .addName(lastname, firstname, additional, prefix, suffix)
      .addNickname(['Jero', 'Jerox'])
      .addSocial('https://x.com/desloovere_j', 'X', 'desloovere_j')
      // Add work data
      .addCompany('Siesqo')
      .addJobtitle('Web Developer')
      .addRole('Data Protection Officer')
      .addEmail('info@jeroendesloovere.be')
      .addPhoneNumber(1234121212, 'PREF;WORK')
      .addPhoneNumber(123456789, 'WORK')
      .addAddress(
        'name',
        'extended',
        'street',
        'worktown',
        'state',
        'workpostcode',
        'Belgium',
      )
      .addUrl('http://www.jeroendesloovere.be')
      .addPhotoUrl(photoURL)
      .addUid('19950401-080045-40000F192713-0052')

    const vCardOutput = vCard.toString()
    const expectedOutput = `\
BEGIN:VCARD\r\n\
VERSION:3.0\r\n\
PRODID:-//vcard-creator//vcard-creator ${LIB_VERSION}//EN\r\n\
REV:${new Date().toISOString()}\r\n\
N;CHARSET=utf-8:Desloovere;Jeroen;;;\r\n\
FN;CHARSET=utf-8:Jeroen Desloovere\r\n\
NICKNAME:Jero,Jerox\r\n\
X-SOCIALPROFILE;type=X;x-user=desloovere_j:https://x.com/desloovere_j\r\n\
IMPP;X-SERVICE-TYPE=X:https://x.com/desloovere_j\r\n\
ORG;CHARSET=utf-8:Siesqo\r\n\
TITLE;CHARSET=utf-8:Web Developer\r\n\
ROLE;CHARSET=utf-8:Data Protection Officer\r\n\
EMAIL:info@jeroendesloovere.be\r\n\
TEL;TYPE=PREF,WORK:1234121212\r\n\
TEL;TYPE=WORK:123456789\r\n\
ADR;TYPE=WORK,POSTAL;CHARSET=utf-8:name;extended;street;worktown;state;work\r\n\
 postcode;Belgium\r\n\
URL:http://www.jeroendesloovere.be\r\n\
PHOTO;VALUE=uri:https://example.com/img/photo.jpg\r\n\
UID:19950401-080045-40000F192713-0052\r\n\
END:VCARD\r\n\
`

    // Compare the results
    expect(vCardOutput).toBe(expectedOutput)
  })

  it("should create and output the proper 'vcalendar' format", () => {
    // Init dates
    const nowISO = new Date().toISOString()
    const nowBase = nowISO.replace(/-/g, '').replace(/:/g, '').substring(0, 13)
    const dtstart = `${nowBase}00`
    const dtend = `${nowBase}01`

    // Define vCard
    const vCard = new VCard('vcalendar')

    vCard
      // Add personal data
      .addName(lastname, firstname, additional, prefix, suffix)
      // Add work data
      .addCompany('Siesqo')
      .addJobtitle('Web Developer')
      .addRole('Data Protection Officer')
      .addEmail('info@jeroendesloovere.be')
      .addPhoneNumber(1234121212, 'PREF;WORK')
      .addPhoneNumber(123456789, 'WORK')
      .addAddress(
        'name',
        'extended',
        'street',
        'worktown',
        'state',
        'workpostcode',
        'Belgium',
      )
      .addUrl('http://www.jeroendesloovere.be')
      .addPhotoUrl(photoURL)

    const vCalendarOutput = vCard.toString()

    const b64vcard = b64encode(vCard.buildVCard())
    const b64mline = chunkSplit(b64vcard, 74, '\n')
    const b64final = b64mline.replace(/(.+)/g, ' $1')
    const expectedOutput = `\
BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
DTSTART;TZID=Europe/London:${dtstart}
DTEND;TZID=Europe/London:${dtend}
SUMMARY:Click the attachment to save to your contacts
DTSTAMP:${dtstart}Z
ATTACH;VALUE=BINARY;ENCODING=BASE64;FMTTYPE=text/directory;
 X-APPLE-FILENAME=vcard.vcf:
${b64final}\
END:VEVENT
END:VCALENDAR
`

    // Compare the results
    expect(vCalendarOutput).toBe(expectedOutput)
  })

  it('should throw on attempting to add the same property', () => {
    // Define vCard
    const vCard = new VCard()

    // Add personal data
    vCard.addName(lastname, firstname, additional, prefix, suffix)

    expect(() => {
      // Add personal data again
      vCard.addName(lastname, firstname, additional, prefix, suffix)
    }).toThrow(VCardException)
  })

  it('should throw on attempting to add an invalid MIME Media Type', () => {
    // Define vCard
    const vCard = new VCard()

    expect(() => {
      vCard.addPhoto('MIICajCCAdOgAwIBAgICBEUwDQYJKoZIhvcN...', 'foobar')
    }).toThrow(VCardException)
  })

  it('should output both X-SOCIALPROFILE and IMPP for social profiles', () => {
    const vCard = new VCard()
    vCard.addSocial('https://linkedin.com/in/jdoe', 'LinkedIn')

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
    vCard.addSocial('https://example.com/profile', '')

    const output = vCard.toString()

    expect(output).toContain('X-SOCIALPROFILE:https://example.com/profile')
    expect(output).toContain('IMPP:https://example.com/profile')
    expect(output).not.toContain('X-SERVICE-TYPE')
    expect(output).not.toContain('x-user')
  })

  it('should support multiple social profiles', () => {
    const vCard = new VCard()
    vCard
      .addSocial('https://x.com/jdoe', 'X', 'jdoe')
      .addSocial('https://linkedin.com/in/jdoe', 'LinkedIn')

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
    vCard.addImpp('xmpp:user@example.com', 'XMPP')

    const output = vCard.toString()

    expect(output).toContain('IMPP;X-SERVICE-TYPE=XMPP:xmpp:user@example.com')
    expect(output).not.toContain('X-SOCIALPROFILE')
  })

  it('should add standalone IMPP without service type', () => {
    const vCard = new VCard()
    vCard.addImpp('sip:user@example.com')

    const output = vCard.toString()

    expect(output).toContain('IMPP:sip:user@example.com')
    expect(output).not.toContain('X-SERVICE-TYPE')
  })

  it('should support multiple IMPP entries', () => {
    const vCard = new VCard()
    vCard
      .addImpp('xmpp:user@example.com', 'XMPP')
      .addImpp('sip:user@example.com', 'SIP')

    const output = vCard.toString()

    expect(output).toContain('IMPP;X-SERVICE-TYPE=XMPP:xmpp:user@example.com')
    expect(output).toContain('IMPP;X-SERVICE-TYPE=SIP:sip:user@example.com')
  })

  it('shoud parse phone numbers correctly', () => {
    // Define vCard
    const vCard = new VCard()

    // Add phone numbers
    vCard
      .addPhoneNumber(1234121212, 'PREF;WORK')
      .addPhoneNumber(123456789, 'WORK')
      .addPhoneNumber('0123456789', 'HOME')

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

    // Compare the results
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
    // First line should be 75 octets, then continuation
    expect(result).toContain('\r\n ')
    // No line segment should exceed 75 octets
    const lines = result.split('\r\n ')
    const encoder = new TextEncoder()
    expect(encoder.encode(lines[0]).length).toBeLessThanOrEqual(75)
  })

  it('should fold CJK text at octet boundaries without splitting characters', () => {
    // Each CJK character is 3 bytes in UTF-8. 25 CJK chars = 75 bytes = exactly the limit
    const exactly75 = '漢'.repeat(25)
    expect(fold(exactly75)).toBe(exactly75)

    // With trailing CRLF — still 75 bytes of content, no fold needed
    const exactly75WithCrlf = '漢'.repeat(25) + '\r\n'
    expect(fold(exactly75WithCrlf)).toBe(exactly75WithCrlf)

    // 26 CJK chars = 78 bytes = over the limit, must fold
    const over75 = '漢'.repeat(26)
    const result = fold(over75)
    expect(result).toContain('\r\n ')
    // Verify no byte sequence is broken: all 26 chars survive
    const charCount = (result.match(/漢/g) || []).length
    expect(charCount).toBe(26)
  })

  it('should fold emoji without splitting multi-byte sequences', () => {
    // Each emoji is 4 bytes. 18 emoji = 72 bytes, 19 = 76 bytes
    const under = '😀'.repeat(18) + '\r\n'
    expect(fold(under)).toBe(under)

    const over = '😀'.repeat(19) + '\r\n'
    const result = fold(over)
    expect(result).toContain('\r\n ')
    // Every emoji should survive intact
    const emojiCount = (result.match(/😀/g) || []).length
    expect(emojiCount).toBe(19)
  })

  it('should fold mixed ASCII and multi-byte text correctly', () => {
    // 60 ASCII bytes + 6 CJK chars (18 bytes) = 78 bytes, over 75
    const mixed = 'A'.repeat(60) + '漢'.repeat(6)
    const result = fold(mixed)
    expect(result).toContain('\r\n ')
    // All characters survive intact
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
})

describe('Test addLabel()', () => {
  it('should add label with default type', () => {
    const vCard = new VCard()
    vCard.addLabel('123 Main St\nSpringfield, IL 62701')
    const output = vCard.toString()
    expect(output).toContain('LABEL;TYPE=WORK,POSTAL;CHARSET=utf-8:')
  })

  it('should add label with custom type', () => {
    const vCard = new VCard()
    vCard.addLabel('Home address', 'HOME')
    expect(vCard.toString()).toContain(
      'LABEL;TYPE=HOME;CHARSET=utf-8:Home address',
    )
  })

  it('should escape newlines in label', () => {
    const vCard = new VCard()
    vCard.addLabel('Line 1\nLine 2')
    expect(vCard.toString()).toContain('Line 1\\nLine 2')
  })

  it('should allow multiple labels', () => {
    const vCard = new VCard()
    vCard.addLabel('Work address', 'WORK')
    vCard.addLabel('Home address', 'HOME')
    const output = vCard.toString()
    expect(output).toContain('LABEL;TYPE=WORK;CHARSET=utf-8:Work address')
    expect(output).toContain('LABEL;TYPE=HOME;CHARSET=utf-8:Home address')
  })
})

describe('Test PRODID', () => {
  it('should include PRODID in every vCard output', () => {
    const vCard = new VCard()
    vCard.addName('Doe', 'John')
    const output = vCard.toString()
    expect(output).toContain(
      `PRODID:-//vcard-creator//vcard-creator ${LIB_VERSION}//EN`,
    )
  })

  it('should place PRODID after VERSION and before REV', () => {
    const vCard = new VCard()
    vCard.addName('Doe', 'John')
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
    vCard.addCustomProperty('X-PHONETIC-FIRST-NAME', 'Jon')
    expect(vCard.toString()).toContain('X-PHONETIC-FIRST-NAME:Jon')
  })

  it('should add custom property with params', () => {
    const vCard = new VCard()
    vCard.addCustomProperty('X-CUSTOM', 'value', 'TYPE=work')
    expect(vCard.toString()).toContain('X-CUSTOM;TYPE=work:value')
  })

  it('should allow multiple custom properties', () => {
    const vCard = new VCard()
    vCard
      .addCustomProperty('X-PHONETIC-FIRST-NAME', 'Jon')
      .addCustomProperty('X-PHONETIC-LAST-NAME', 'Sumisu')
      .addCustomProperty('X-ANNIVERSARY', '2010-06-15')
    const output = vCard.toString()
    expect(output).toContain('X-PHONETIC-FIRST-NAME:Jon')
    expect(output).toContain('X-PHONETIC-LAST-NAME:Sumisu')
    expect(output).toContain('X-ANNIVERSARY:2010-06-15')
  })

  it('should uppercase the property name', () => {
    const vCard = new VCard()
    vCard.addCustomProperty('x-custom-field', 'test')
    expect(vCard.toString()).toContain('X-CUSTOM-FIELD:test')
  })

  it('should handle empty value', () => {
    const vCard = new VCard()
    vCard.addCustomProperty('X-EMPTY', '')
    expect(vCard.toString()).toContain('X-EMPTY:')
  })

  it('should handle empty params', () => {
    const vCard = new VCard()
    vCard.addCustomProperty('X-TEST', 'value', '')
    const output = vCard.toString()
    expect(output).toContain('X-TEST:value')
    expect(output).not.toContain('X-TEST;')
  })
})

describe('Object params API', () => {
  it('addName with options object', () => {
    const vCard = new VCard()
    vCard.addName({ lastName: 'Doe', firstName: 'John', prefix: 'Dr.' })
    const output = vCard.toString()
    expect(output).toContain('N;CHARSET=utf-8:Doe;John;;Dr.;')
    expect(output).toContain('FN;CHARSET=utf-8:Dr. John Doe')
  })

  it('addAddress with options and typed array', () => {
    const vCard = new VCard()
    vCard.addAddress({
      street: '123 Main St',
      city: 'Springfield',
      region: 'IL',
      zip: '62701',
      country: 'USA',
      type: ['home', 'postal'],
    })
    const output = vCard.toString()
    expect(output).toContain('ADR;TYPE=HOME,POSTAL;CHARSET=utf-8:')
    expect(output).toContain('123 Main St;Springfield;IL;62701;USA')
  })

  it('addAddress with default type', () => {
    const vCard = new VCard()
    vCard.addAddress({ street: '123 Main St' })
    expect(vCard.toString()).toContain('ADR;TYPE=WORK,POSTAL;CHARSET=utf-8:')
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
    expect(vCard.toString()).toContain(
      'ORG;CHARSET=utf-8:Acme Corp;Engineering',
    )
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
      'LABEL;TYPE=HOME;CHARSET=utf-8:123 Main St\\nSpringfield',
    )
  })

  it('addLabel with options, default type', () => {
    const vCard = new VCard()
    vCard.addLabel({ label: 'Work address' })
    expect(vCard.toString()).toContain(
      'LABEL;TYPE=WORK,POSTAL;CHARSET=utf-8:Work address',
    )
  })
})

describe('resolveType wire format', () => {
  it('typed array produces TYPE= format', () => {
    const vCard = new VCard()
    vCard.addPhoneNumber({ number: '123', type: ['work', 'voice'] })
    expect(vCard.toString()).toContain('TEL;TYPE=WORK,VOICE:123')
  })

  it('legacy string still works', () => {
    const vCard = new VCard()
    vCard.addPhoneNumber('123', 'WORK;VOICE')
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
    expect(vCard.toString()).toContain('ADR;CHARSET=utf-8:')
    expect(vCard.toString()).not.toContain('TYPE=')
  })
})

describe('Full chain with object API', () => {
  it('should produce valid vCard output with all object params', () => {
    const vCard = new VCard()
    vCard
      .addName({ lastName: 'Doe', firstName: 'John' })
      .addCompany({ name: 'Acme' })
      .addEmail({ address: 'john@acme.com', type: ['work'] })
      .addPhoneNumber({ number: '+1555', type: ['cell'] })
      .addAddress({ street: '123 Main', city: 'NYC', type: ['work'] })
      .addUrl({ url: 'https://acme.com' })

    const output = vCard.toString()
    expect(output).toContain('BEGIN:VCARD')
    expect(output).toContain('N;CHARSET=utf-8:Doe;John;;;')
    expect(output).toContain('EMAIL;TYPE=WORK:john@acme.com')
    expect(output).toContain('TEL;TYPE=CELL:+1555')
    expect(output).toContain('ADR;TYPE=WORK;CHARSET=utf-8:')
    expect(output).toContain('URL:https://acme.com')
    expect(output).toContain('END:VCARD')
  })
})
