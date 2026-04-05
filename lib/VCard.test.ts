import { vi } from 'vitest'
import VCard from './VCard'
import VCardException from './VCardException'
import { b64encode, chunkSplit } from './utils/functions'

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
REV:${new Date().toISOString()}\r\n\
N;CHARSET=utf-8:Desloovere;Jeroen;;;\r\n\
FN;CHARSET=utf-8:Jeroen Desloovere\r\n\
NICKNAME:Jero,Jerox\r\n\
X-SOCIALPROFILE;type=X;x-user=desloovere_j:https://x.com/desloovere_j\r\n\
IMPP;X-SERVICE-TYPE=X:https://x.com/desloovere_j\r\n\
ORG;CHARSET=utf-8:Siesqo\r\n\
TITLE;CHARSET=utf-8:Web Developer\r\n\
ROLE;CHARSET=utf-8:Data Protection Officer\r\n\
EMAIL;INTERNET:info@jeroendesloovere.be\r\n\
TEL;PREF;WORK:1234121212\r\n\
TEL;WORK:123456789\r\n\
ADR;WORK;POSTAL;CHARSET=utf-8:name;extended;street;worktown;state;workpos\r\n\
 tcode;Belgium\r\n\
URL:http://www.jeroendesloovere.be\r\n\
PHOTO;VALUE=uri:https://example.com/img/photo.jpg\r\n\
UID:19950401-080045-40000F192713-0052\r\n\
END:VCARD\r\n\
`

    // Compare the results
    expect(vCardOutput).toBe(expectedOutput)

    // Clear the fixed date
  })

  it("should create and output the proper 'vcalendar' format", () => {
    // Setup a fixed date

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

    // Clear the fixed date
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
REV:${new Date().toISOString()}\r\n\
TEL;PREF;WORK:1234121212\r\n\
TEL;WORK:123456789\r\n\
TEL;HOME:0123456789\r\n\
END:VCARD\r\n\
`

    // Compare the results
    expect(vCardOutput).toBe(expectedOutput)
  })
})
