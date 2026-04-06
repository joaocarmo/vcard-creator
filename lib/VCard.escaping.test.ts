import VCard from './VCard'

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
