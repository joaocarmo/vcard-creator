import VCard from './VCard'
import VCardException from './VCardException'
import { LIB_VERSION } from './constants'
import { freezeTime } from '../test/helpers'

describe('vCard output format', () => {
  const photoURL = 'https://example.com/img/photo.jpg'

  freezeTime()

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
REV:2024-01-15T10:00:00Z\r\n\
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
ADR;TYPE=INTL,POSTAL,PARCEL,WORK:name;extended;street;worktown;state;workpo\r\n stcode;Belgium\r\n\
URL:http://www.jeroendesloovere.be\r\n\
PHOTO;VALUE=uri:https://example.com/img/photo.jpg\r\n\
UID:19950401-080045-40000F192713-0052\r\n\
END:VCARD\r\n\
`

    expect(vCardOutput).toBe(expectedOutput)
  })
})

describe('PRODID', () => {
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

  it('should add CHARSET to a text property for a non-default charset', () => {
    const vCard = new VCard()
    vCard.setCharset('iso-8859-1')
    vCard.addNote('A note')
    expect(vCard.toString()).toContain('NOTE;CHARSET=iso-8859-1:A note')
  })

  it.each(['\r', '\n', '\r\n'])(
    'should throw on line break %j in the charset',
    (lineBreak) => {
      const vCard = new VCard()
      vCard.addNote('Call me')
      vCard.setCharset(`utf-16${lineBreak}X-INJECTED:1`)

      expect(() => vCard.toString()).toThrow(VCardException)
    },
  )

  it('should quote a charset with ";", ":" or ","', () => {
    const vCard = new VCard()
    vCard.setCharset('a;b:c')
    vCard.addName({ familyName: 'Doe', givenName: 'John' })

    expect(vCard.toString()).toContain('N;CHARSET="a;b:c":Doe;John;;;')
  })

  it('should throw on a double quote in the charset', () => {
    const vCard = new VCard()
    vCard.setCharset('a"b')
    vCard.addNote('Call me')

    expect(() => vCard.toString()).toThrow(
      'Charset values must not contain a double quote (got "a\\"b")',
    )
  })

  it('should accept a tab in the charset', () => {
    const vCard = new VCard()
    vCard.setCharset('a\tb')
    vCard.addNote('Call me')

    expect(vCard.toString()).toContain('NOTE;CHARSET=a\tb:Call me')
  })
})

describe('once-only and repeatable properties', () => {
  it('should store each call of a repeatable property', () => {
    const vCard = new VCard()
    vCard.addNote('a').addNote('b')

    expect(vCard.getProperties()).toHaveLength(2)
  })

  it('should throw and store nothing on a second call', () => {
    const vCard = new VCard()
    vCard.addJobtitle('Developer')

    expect(() => vCard.addJobtitle('Manager')).toThrow(VCardException)
    expect(vCard.getProperties()).toHaveLength(1)
  })
})

describe('buildVCard()', () => {
  freezeTime()

  it('should return the same string as toString()', () => {
    const vCard = new VCard()
    vCard.addName({ familyName: 'Doe', givenName: 'John' })
    expect(vCard.buildVCard()).toBe(vCard.toString())
  })

  it('should return the same string as toString() for a non-default charset', () => {
    const vCard = new VCard()
    vCard.setCharset('iso-8859-1')
    vCard.addName({ familyName: 'Doe', givenName: 'John' })
    expect(vCard.buildVCard()).toBe(vCard.toString())
  })

  it('should not be called by toString()', () => {
    const spy = vi.spyOn(VCard.prototype, 'buildVCard')
    new VCard().addName({ familyName: 'Doe', givenName: 'John' }).toString()
    expect(spy).not.toHaveBeenCalled()
  })

  it('should not recurse when a subclass toString() calls it', () => {
    class UpperVCard extends VCard {
      override toString(): string {
        return this.buildVCard().toUpperCase()
      }
    }
    const name = { familyName: 'Doe', givenName: 'John' }
    const expected = new VCard().addName(name).toString().toUpperCase()
    expect(new UpperVCard().addName(name).toString()).toBe(expected)
  })
})

describe('getCharsetString()', () => {
  it('should not be called by toString()', () => {
    const spy = vi.spyOn(VCard.prototype, 'getCharsetString')
    const vCard = new VCard()
    vCard.setCharset('iso-8859-1')
    vCard.addName({ familyName: 'Doe', givenName: 'John' }).toString()
    expect(spy).not.toHaveBeenCalled()
  })

  it('should return an empty string for the default charset', () => {
    expect(new VCard().getCharsetString()).toBe('')
  })

  it('should return the CHARSET parameter for a non-default charset', () => {
    const vCard = new VCard()
    vCard.setCharset('iso-8859-1')
    expect(vCard.getCharsetString()).toBe(';CHARSET=iso-8859-1')
  })

  it('should quote a charset with ";", ":" or ","', () => {
    const vCard = new VCard()
    vCard.setCharset('a;b:c')
    expect(vCard.getCharsetString()).toBe(';CHARSET="a;b:c"')
  })
})

describe('concat()', () => {
  freezeTime()

  function createCard(givenName: string, familyName: string): VCard {
    return new VCard()
      .addName({ givenName, familyName })
      .addEmail({ address: `${givenName.toLowerCase()}@example.com` })
  }

  describe('static concat()', () => {
    it('should combine two cards into a multi-contact string', () => {
      const output = VCard.concat(
        createCard('Alice', 'Smith'),
        createCard('Bob', 'Jones'),
      )

      expect((output.match(/BEGIN:VCARD/g) || []).length).toBe(2)
      expect((output.match(/END:VCARD/g) || []).length).toBe(2)
      expect(output).toContain('FN:Alice Smith')
      expect(output).toContain('FN:Bob Jones')
    })

    it('should combine three cards', () => {
      const output = VCard.concat(
        createCard('Alice', 'Smith'),
        createCard('Bob', 'Jones'),
        createCard('Carol', 'Lee'),
      )

      expect((output.match(/BEGIN:VCARD/g) || []).length).toBe(3)
      expect(output).toContain('FN:Carol Lee')
    })

    it('should return the same as buildVCard() for a single card', () => {
      const card = createCard('Alice', 'Smith')

      expect(VCard.concat(card)).toBe(card.buildVCard())
    })

    it('should return empty string for no args', () => {
      expect(VCard.concat()).toBe('')
    })

    it('should keep each card properties within its own BEGIN/END block', () => {
      const output = VCard.concat(
        createCard('Alice', 'Smith'),
        createCard('Bob', 'Jones'),
      )
      const cards = output.split('END:VCARD\r\n').filter(Boolean)

      expect(cards[0]).toContain('FN:Alice Smith')
      expect(cards[0]).toContain('alice@example.com')
      expect(cards[0]).not.toContain('FN:Bob Jones')

      expect(cards[1]).toContain('FN:Bob Jones')
      expect(cards[1]).toContain('bob@example.com')
      expect(cards[1]).not.toContain('FN:Alice Smith')
    })

    it('should not call buildVCard()', () => {
      const spy = vi.spyOn(VCard.prototype, 'buildVCard')
      VCard.concat(createCard('Alice', 'Smith'), createCard('Bob', 'Jones'))
      expect(spy).not.toHaveBeenCalled()
    })
  })

  describe('instance concat()', () => {
    it('should produce the same result as static concat', () => {
      const card1 = createCard('Alice', 'Smith')
      const card2 = createCard('Bob', 'Jones')

      expect(card1.concat(card2)).toBe(VCard.concat(card1, card2))
    })

    it('should place this card first', () => {
      const output = createCard('Alice', 'Smith').concat(
        createCard('Bob', 'Jones'),
        createCard('Carol', 'Lee'),
      )

      const firstFN = output.indexOf('FN:Alice Smith')
      const secondFN = output.indexOf('FN:Bob Jones')
      const thirdFN = output.indexOf('FN:Carol Lee')

      expect(firstFN).toBeLessThan(secondFN)
      expect(secondFN).toBeLessThan(thirdFN)
    })

    it('should return same as buildVCard() with no args', () => {
      const card = createCard('Alice', 'Smith')

      expect(card.concat()).toBe(card.buildVCard())
    })

    it('should not call buildVCard()', () => {
      const spy = vi.spyOn(VCard.prototype, 'buildVCard')
      createCard('Alice', 'Smith').concat(createCard('Bob', 'Jones'))
      expect(spy).not.toHaveBeenCalled()
    })
  })
})

describe('property grouping', () => {
  it('should write no prefix for an empty group', () => {
    const vCard = new VCard()
    vCard.addCustomProperty({ name: 'X-TEST', value: 'value', group: '' })
    const output = vCard.toString()
    expect(output).toContain('\r\nX-TEST:value')
    expect(output).not.toContain('.X-TEST')
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
    expect(output).toContain('\r\nitem1.TEL:+1-555-1234\r\n')
    expect(output).toContain('\r\nitem1.X-ABLABEL:Work Phone\r\n')
  })

  it('should not prefix ungrouped properties', () => {
    const vCard = new VCard()
    vCard.addCustomProperty({ name: 'X-TEST', value: 'value' })
    const output = vCard.toString()
    expect(output).toContain('X-TEST:value')
    expect(output).not.toContain('.X-TEST')
  })

  it('should throw and store nothing on an invalid group', () => {
    const vCard = new VCard()
    expect(() =>
      vCard.addCustomProperty({ name: 'TEL', value: 'a', group: 'item.1' }),
    ).toThrow(VCardException)
    expect(vCard.getProperties()).toEqual([])
  })
})

describe('error order', () => {
  it('should report the value before the parameters', () => {
    expect(() =>
      new VCard().addLabel({ label: 'a\x00b', type: 'work' as never }),
    ).toThrow(
      'Label values must not contain control characters (got "a\\u0000b")',
    )
  })

  it('should report the parameters in output order', () => {
    expect(() =>
      new VCard().addSocial({
        url: 'https://example.com',
        type: 'a"b',
        user: 'c"d',
      }),
    ).toThrow(
      'Social profile TYPE values must not contain a double quote (got "a\\"b")',
    )
  })
})
