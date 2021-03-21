import { advanceTo, clear } from 'jest-date-mock'
import VCard from '../VCard'
import { b64encode, chunkSplit } from '../utils/functions'

describe('Test vCard', () => {
  it("should create and output the proper 'vcard' format", () => {
    // setup a fixed date
    advanceTo(new Date())

    // define vCard
    const vCard = new VCard()

    // define variables
    const lastname = 'Desloovere'
    const firstname = 'Jeroen'
    const additional = ''
    const prefix = ''
    const suffix = ''

    vCard
      // add personal data
      .addName(lastname, firstname, additional, prefix, suffix)
      // add work data
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
      .addURL('http://www.jeroendesloovere.be')

    const vCardOutput = vCard.toString()
    const expectedOutput = `\
BEGIN:VCARD\r\n\
VERSION:3.0\r\n\
REV:${new Date().toISOString()}\r\n\
N;CHARSET=utf-8:Desloovere;Jeroen;;;\r\n\
FN;CHARSET=utf-8:Jeroen Desloovere\r\n\
ORG;CHARSET=utf-8:Siesqo\r\n\
TITLE;CHARSET=utf-8:Web Developer\r\n\
ROLE;CHARSET=utf-8:Data Protection Officer\r\n\
EMAIL;INTERNET:info@jeroendesloovere.be\r\n\
TEL;PREF;WORK:1234121212\r\n\
TEL;WORK:123456789\r\n\
ADR;WORK;POSTAL;CHARSET=utf-8:name;extended;street;worktown;state;workpos\r\n\
 tcode;Belgium\r\n\
URL:http://www.jeroendesloovere.be\r\n\
END:VCARD\r\n\
`

    // compare the results
    expect(vCardOutput).toBe(expectedOutput)

    // clear the fixed date
    clear()
  })

  it("should create and output the proper 'vcalendar' format", () => {
    // setup a fixed date
    advanceTo(new Date())

    // init dates
    const nowISO = new Date().toISOString()
    const nowBase = nowISO.replace(/-/g, '').replace(/:/g, '').substring(0, 13)
    const dtstart = `${nowBase}00`
    const dtend = `${nowBase}01`

    // define vCard
    const vCard = new VCard('vcalendar')

    // define variables
    const lastname = 'Desloovere'
    const firstname = 'Jeroen'
    const additional = ''
    const prefix = ''
    const suffix = ''

    vCard
      // add personal data
      .addName(lastname, firstname, additional, prefix, suffix)
      // add work data
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
      .addURL('http://www.jeroendesloovere.be')

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

    // compare the results
    expect(vCalendarOutput).toBe(expectedOutput)

    // clear the fixed date
    clear()
  })
})
