import VCard from './VCard'
import { fold } from './utils/functions'

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
})
