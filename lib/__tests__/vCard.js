import { advanceTo, clear } from 'jest-date-mock'
import VCard from '../vCard'

describe('Test vCard', () => {
  it('should create and output the proper format', () => {
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

    // add personal data
    vCard.addName(lastname, firstname, additional, prefix, suffix)

    // add work data
    vCard.addCompany('Siesqo')
    vCard.addJobtitle('Web Developer')
    vCard.addRole('Data Protection Officer')
    vCard.addEmail('info@jeroendesloovere.be')
    vCard.addPhoneNumber(1234121212, 'PREF;WORK')
    vCard.addPhoneNumber(123456789, 'WORK')
    vCard.addAddress('name', 'extended', 'street', 'worktown', 'state', 'workpostcode', 'Belgium')
    vCard.addURL('http://www.jeroendesloovere.be')

    const vCardOutput = vCard.toString()
    const expectedOutput = `\
BEGIN:VCARD\r\n\
VERSION:3.0\r\n\
REV:${(new Date()).toISOString()}\r\n\
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
})
