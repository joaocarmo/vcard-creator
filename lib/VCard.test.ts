import { vi } from 'vitest'
import VCard from './VCard'
import VCardException from './VCardException'
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
      .addPhoto({ url: photoURL })
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

describe('Metadata getters', () => {
  it('should return default content type', () => {
    const vCard = new VCard()
    expect(vCard.getContentType()).toBe('text/vcard')
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
