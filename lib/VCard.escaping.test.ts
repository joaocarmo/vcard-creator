import VCard from './VCard'
import VCardException from './VCardException'
import type {
  AddressType,
  DateString,
  EmailType,
  PhoneType,
  UrlType,
} from './types/VCard'

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
      vCard.addGeo({ latitude: 37.386, longitude: -122.083 })
      expect(vCard.toString()).toContain('GEO:37.386;-122.083')
    })

    it('should not escape custom property values', () => {
      const vCard = new VCard()
      vCard.addCustomProperty({ name: 'X-TEST', value: 'a;b,c\\d' })
      expect(vCard.toString()).toContain('X-TEST:a;b,c\\d')
    })
  })

  describe('line breaks in every string value', () => {
    type Call = (card: VCard, s: string) => unknown

    // Each call appends `s` to 1 string value and keeps the others valid
    const calls: Record<string, Call[]> = {
      addAddress: [
        (c, s) => c.addAddress({ postOfficeBox: s }),
        (c, s) => c.addAddress({ extended: s }),
        (c, s) => c.addAddress({ street: s }),
        (c, s) => c.addAddress({ locality: s }),
        (c, s) => c.addAddress({ region: s }),
        (c, s) => c.addAddress({ postalCode: s }),
        (c, s) => c.addAddress({ country: s }),
        (c, s) => c.addAddress({ type: [`home${s}` as AddressType] }),
      ],
      addBirthday: [(c, s) => c.addBirthday(`1990-05-15${s}` as DateString)],
      addCompany: [
        (c, s) => c.addCompany({ name: `Acme${s}` }),
        (c, s) => c.addCompany({ name: 'Acme', department: `Dev${s}` }),
      ],
      addEmail: [
        (c, s) => c.addEmail({ address: `a@example.com${s}` }),
        (c, s) =>
          c.addEmail({
            address: 'a@example.com',
            type: [`work${s}` as EmailType],
          }),
      ],
      addKey: [
        (c, s) => c.addKey({ url: `https://example.com/k${s}` }),
        (c, s) => c.addKey({ key: `data${s}` }),
        (c, s) => c.addKey({ key: 'data', mime: `PGP${s}` }),
      ],
      addJobtitle: [(c, s) => c.addJobtitle(s)],
      addRole: [(c, s) => c.addRole(s)],
      addFullName: [(c, s) => c.addFullName(s)],
      addName: [
        (c, s) => c.addName({ familyName: s }),
        (c, s) => c.addName({ givenName: s }),
        (c, s) => c.addName({ additionalNames: s }),
        (c, s) => c.addName({ honorificPrefix: s }),
        (c, s) => c.addName({ honorificSuffix: s }),
      ],
      addNickname: [
        (c, s) => c.addNickname(s),
        (c, s) => c.addNickname(['Jo', s]),
      ],
      addNote: [(c, s) => c.addNote(s)],
      addCategories: [(c, s) => c.addCategories(['Work', s])],
      addPhoneNumber: [
        (c, s) => c.addPhoneNumber({ number: `+1-555-0100${s}` }),
        (c, s) =>
          c.addPhoneNumber({
            number: '+1-555-0100',
            type: [`cell${s}` as PhoneType],
          }),
      ],
      addLogo: [
        (c, s) => c.addLogo({ url: `https://example.com/l${s}` }),
        (c, s) => c.addLogo({ image: `data${s}` }),
        (c, s) => c.addLogo({ image: 'data', mime: `png${s}` }),
      ],
      addPhoto: [
        (c, s) => c.addPhoto({ url: `https://example.com/p${s}` }),
        (c, s) => c.addPhoto({ image: `data${s}` }),
        (c, s) => c.addPhoto({ image: 'data', mime: `png${s}` }),
      ],
      addUrl: [
        (c, s) => c.addUrl({ url: `https://example.com/${s}` }),
        (c, s) =>
          c.addUrl({
            url: 'https://example.com',
            type: [`work${s}` as UrlType],
          }),
      ],
      addSocial: [
        (c, s) => c.addSocial({ url: `https://example.com/${s}`, type: 'x' }),
        (c, s) => c.addSocial({ url: 'https://example.com', type: `x${s}` }),
        (c, s) =>
          c.addSocial({ url: 'https://example.com', type: 'x', user: `u${s}` }),
      ],
      addImpp: [
        (c, s) => c.addImpp({ uri: `xmpp:a@example.com${s}` }),
        (c, s) =>
          c.addImpp({ uri: 'xmpp:a@example.com', serviceType: `Jabber${s}` }),
      ],
      addUid: [(c, s) => c.addUid(`uid${s}`)],
      addGeo: [],
      addTimezone: [(c, s) => c.addTimezone(`Europe/Lisbon${s}`)],
      addSortString: [(c, s) => c.addSortString(s)],
      addRevision: [],
      addLabel: [
        (c, s) => c.addLabel({ label: `Street 1${s}` }),
        (c, s) =>
          c.addLabel({ label: 'Street 1', type: [`home${s}` as AddressType] }),
      ],
      addCustomProperty: [
        (c, s) => c.addCustomProperty({ name: `X-A${s}`, value: 'v' }),
        (c, s) => c.addCustomProperty({ name: 'X-A', value: s }),
        (c, s) =>
          c.addCustomProperty({ name: 'X-A', value: 'v', params: `X-P=1${s}` }),
        (c, s) =>
          c.addCustomProperty({ name: 'X-A', value: 'v', group: `item1${s}` }),
      ],
    }

    it('should cover every public add*() method', () => {
      const methods = Object.getOwnPropertyNames(VCard.prototype).filter(
        (name) =>
          name.startsWith('add') &&
          name !== 'addMediaUrl' &&
          name !== 'addMediaContent',
      )

      expect(Object.keys(calls).sort()).toEqual(methods.sort())
    })

    it.each(Object.entries(calls))(
      'should escape or reject line breaks in %s()',
      (_, methodCalls) => {
        for (const call of methodCalls) {
          // The other values are valid, so a throw below comes from `s`
          expect(() => call(new VCard(), '')).not.toThrow()

          for (const lineBreak of ['\r', '\n', '\r\n']) {
            const vCard = new VCard()
            const s = `a${lineBreak}X-INJECTED:1`

            try {
              call(vCard, s)
            } catch (error) {
              expect(error).toBeInstanceOf(VCardException)
              expect(vCard.getProperties()).toEqual([])
              continue
            }

            expect(vCard.toString().replace(/\r\n/g, '')).not.toMatch(/[\r\n]/)
          }
        }
      },
    )

    it.each(Object.entries(calls))(
      'should reject a C0 control character in %s()',
      (_, methodCalls) => {
        for (const call of methodCalls) {
          const vCard = new VCard()

          expect(() => call(vCard, 'a\x0Bb')).toThrow(VCardException)
          expect(vCard.getProperties()).toEqual([])
        }
      },
    )

    // Built-in methods that escape text values
    const textMethods = new Set([
      'addAddress',
      'addCategories',
      'addCompany',
      'addFullName',
      'addJobtitle',
      'addLabel',
      'addName',
      'addNickname',
      'addNote',
      'addRole',
      'addSortString',
      'addTimezone',
    ])

    it.each(
      Object.entries(calls).flatMap(([method, methodCalls]) =>
        ['\x85', '\u{2028}', '\u{2029}'].map(
          (char) => [method, char, methodCalls] as const,
        ),
      ),
    )(
      'should reject or keep a line separator in %s(): %j',
      (method, char, methodCalls) => {
        for (const call of methodCalls) {
          const vCard = new VCard()
          const s = `a${char}b`

          try {
            call(vCard, s)
          } catch (error) {
            expect(error).toBeInstanceOf(VCardException)
            expect(vCard.getProperties()).toEqual([])
            continue
          }

          // Only text values may keep the character
          expect(textMethods).toContain(method)
          expect(vCard.toString().replace(/\r\n /g, '')).toContain(s)
        }
      },
    )

    it('should throw on U+2028 in a URL', () => {
      expect(() =>
        new VCard().addUrl({ url: 'https://a.com/\u{2028}x' }),
      ).toThrow(VCardException)
    })

    it('should write valid values as before', () => {
      const vCard = new VCard()
      vCard
        .addLabel({ label: 'Street 1', type: ['home'] })
        .addNote('Call me')
        .addCustomProperty({ name: 'X-A', value: 'a;b', group: 'item1' })
        .addUid('urn:uuid:1234')

      const output = vCard.toString()
      expect(output).toContain('LABEL;TYPE=HOME:Street 1\r\n')
      expect(output).toContain('NOTE:Call me\r\n')
      expect(output).toContain('item1.X-A:a;b\r\n')
      expect(output).toContain('UID:urn:uuid:1234\r\n')
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
  })
})
