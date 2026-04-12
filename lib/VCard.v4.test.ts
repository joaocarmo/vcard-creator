import VCard from './VCard'
import VCardException from './VCardException'

// ── Phase 1: Constructor, factory, version ────────────────────────────────────

describe('VCard v4 constructor and factory', () => {
  it('should default to v3 when no options are provided', () => {
    const vCard = new VCard()
    expect(vCard.getVersion()).toBe(3)
  })

  it('should create a v4 instance via options', () => {
    const vCard = new VCard({ version: 4 })
    expect(vCard.getVersion()).toBe(4)
  })

  it('should create a v4 instance via VCard.v4() factory', () => {
    const vCard = VCard.v4()
    expect(vCard.getVersion()).toBe(4)
  })

  it('should have getUseGroups default to false', () => {
    expect(VCard.v4().getUseGroups()).toBe(false)
  })

  it('should have getUseGroups return true when set via options', () => {
    const vCard = new VCard({ version: 4, useGroups: true })
    expect(vCard.getUseGroups()).toBe(true)
  })
})

// ── Phase 2: Output format gating ─────────────────────────────────────────────

describe('buildVCard() VERSION line', () => {
  it('should emit VERSION:3.0 for v3', () => {
    const vCard = new VCard()
    vCard.addFullName('Test')
    expect(vCard.buildVCard()).toContain('VERSION:3.0')
  })

  it('should emit VERSION:4.0 for v4', () => {
    const vCard = VCard.v4()
    vCard.addFullName('Test')
    expect(vCard.buildVCard()).toContain('VERSION:4.0')
  })

  it('should not emit VERSION:3.0 for v4', () => {
    const vCard = VCard.v4()
    vCard.addFullName('Test')
    expect(vCard.buildVCard()).not.toContain('VERSION:3.0')
  })
})

describe('buildVCard() v4 CHARSET suppression', () => {
  it('should not emit CHARSET param in v4 even when charset is set', () => {
    const vCard = VCard.v4()
    vCard.setCharset('iso-8859-1')
    vCard.addFullName('Test')
    expect(vCard.buildVCard()).not.toContain('CHARSET=')
  })

  it('should emit CHARSET param in v3 when charset is set', () => {
    const vCard = new VCard()
    vCard.setCharset('iso-8859-1')
    vCard.addFullName('Test')
    expect(vCard.buildVCard()).toContain('CHARSET=iso-8859-1')
  })
})

describe('addGeo() v4 URI format', () => {
  it('should emit geo: URI scheme in v4', () => {
    const vCard = VCard.v4()
    vCard.addGeo({ latitude: 48.8582, longitude: 2.2945 })
    expect(vCard.buildVCard()).toContain('GEO:geo:48.8582,2.2945')
  })

  it('should emit semicolon-separated format in v3', () => {
    const vCard = new VCard()
    vCard.addGeo({ latitude: 48.8582, longitude: 2.2945 })
    expect(vCard.buildVCard()).toContain('GEO:48.8582;2.2945')
  })
})

describe('addLabel() v4 no-op', () => {
  it('should not emit LABEL property in v4', () => {
    const vCard = VCard.v4()
    vCard.addLabel({ label: '123 Main St' })
    expect(vCard.buildVCard()).not.toContain('LABEL')
  })

  it('should still emit LABEL property in v3', () => {
    const vCard = new VCard()
    vCard.addLabel({ label: '123 Main St' })
    expect(vCard.buildVCard()).toContain('LABEL')
  })
})

describe('addSortString() v4 SORT-AS on N', () => {
  it('should apply SORT-AS to the N property key when N is defined first', () => {
    const vCard = VCard.v4()
    vCard.addName({ familyName: 'Smith', givenName: 'John' })
    vCard.addSortString('Smith,John')
    expect(vCard.buildVCard()).toContain('N;SORT-AS="Smith,John":')
    expect(vCard.buildVCard()).not.toContain('SORT-STRING')
  })

  it('should apply SORT-AS to the N property key when N is defined after addSortString()', () => {
    const vCard = VCard.v4()
    vCard.addSortString('Smith,John')
    vCard.addName({ familyName: 'Smith', givenName: 'John' })
    expect(vCard.buildVCard()).toContain('N;SORT-AS="Smith,John":')
    expect(vCard.buildVCard()).not.toContain('SORT-STRING')
  })

  it('should not emit a standalone SORT-STRING property in v4', () => {
    const vCard = VCard.v4()
    vCard.addSortString('Doe,Jane')
    vCard.addName({ familyName: 'Doe', givenName: 'Jane' })
    const output = vCard.buildVCard()
    expect(output).not.toContain('SORT-STRING')
    expect(output).not.toContain('V4-SORT-AS')
  })

  it('should emit SORT-STRING property in v3', () => {
    const vCard = new VCard()
    vCard.addSortString('Smith')
    expect(vCard.buildVCard()).toContain('SORT-STRING:Smith')
  })
})

describe('addBirthday() v4 CALSCALE param', () => {
  it('should emit CALSCALE param in v4 when provided', () => {
    const vCard = VCard.v4()
    vCard.addBirthday('19900601', 'gregorian')
    expect(vCard.buildVCard()).toContain('BDAY;CALSCALE=gregorian:19900601')
  })

  it('should omit CALSCALE param when not provided', () => {
    const vCard = VCard.v4()
    vCard.addBirthday(new Date('1990-06-01'))
    expect(vCard.buildVCard()).toContain('BDAY:1990-06-01')
  })

  it('should accept Date objects in v4 same as v3', () => {
    const vCard = VCard.v4()
    vCard.addBirthday(new Date('1990-06-01'))
    const vCardV3 = new VCard()
    vCardV3.addBirthday(new Date('1990-06-01'))
    expect(vCard.buildVCard()).toContain('BDAY:1990-06-01')
    expect(vCardV3.buildVCard()).toContain('BDAY:1990-06-01')
  })
})

// ── Phase 3: v4-only methods ──────────────────────────────────────────────────

describe('assertV4 guard', () => {
  it('should throw VCardException when calling addKind on a v3 instance', () => {
    expect(() => new VCard().addKind('individual')).toThrow(VCardException)
  })

  it('should throw VCardException when calling addGender on a v3 instance', () => {
    expect(() => new VCard().addGender({ sex: 'M' })).toThrow(VCardException)
  })

  it('should include the method name in the error message', () => {
    expect(() => new VCard().addKind('org')).toThrow('addKind()')
  })
})

describe('addKind()', () => {
  it('should emit KIND:individual', () => {
    const vCard = VCard.v4()
    vCard.addKind('individual')
    expect(vCard.buildVCard()).toContain('KIND:individual')
  })

  it('should emit KIND:group', () => {
    expect(VCard.v4().addKind('group').buildVCard()).toContain('KIND:group')
  })

  it('should emit KIND:org', () => {
    expect(VCard.v4().addKind('org').buildVCard()).toContain('KIND:org')
  })

  it('should normalise to lower case', () => {
    const vCard = VCard.v4()
    vCard.addKind('Individual' as 'individual')
    expect(vCard.buildVCard()).toContain('KIND:individual')
  })

  it('should throw on duplicate KIND', () => {
    const vCard = VCard.v4()
    vCard.addKind('individual')
    expect(() => vCard.addKind('org')).toThrow(VCardException)
  })
})

describe('addSource()', () => {
  it('should emit SOURCE property', () => {
    const vCard = VCard.v4()
    vCard.addSource('ldap://example.com/cn=Ada')
    expect(vCard.buildVCard()).toContain('SOURCE:ldap://example.com/cn=Ada')
  })

  it('should allow multiple SOURCE properties', () => {
    const vCard = VCard.v4()
    vCard.addSource('ldap://example.com/1')
    vCard.addSource('ldap://example.com/2')
    const output = vCard.buildVCard()
    expect(output).toContain('ldap://example.com/1')
    expect(output).toContain('ldap://example.com/2')
  })
})

describe('addXml()', () => {
  it('should emit XML property', () => {
    const vCard = VCard.v4()
    vCard.addXml('<foo xmlns="urn:example"/>')
    expect(vCard.buildVCard()).toContain('XML:<foo xmlns="urn:example"/>')
  })

  it('should allow multiple XML properties', () => {
    const vCard = VCard.v4()
    vCard.addXml('<a/>')
    vCard.addXml('<b/>')
    const output = vCard.buildVCard()
    expect(output).toContain('XML:<a/>')
    expect(output).toContain('XML:<b/>')
  })
})

describe('addAnniversary()', () => {
  it('should emit ANNIVERSARY with a Date object', () => {
    const vCard = VCard.v4()
    vCard.addAnniversary({ date: new Date('2010-06-15') })
    expect(vCard.buildVCard()).toContain('ANNIVERSARY:2010-06-15')
  })

  it('should emit ANNIVERSARY with a string date', () => {
    const vCard = VCard.v4()
    vCard.addAnniversary({ date: '--0615' })
    expect(vCard.buildVCard()).toContain('ANNIVERSARY:--0615')
  })

  it('should emit CALSCALE param when provided', () => {
    const vCard = VCard.v4()
    vCard.addAnniversary({ date: '20100615', calscale: 'gregorian' })
    expect(vCard.buildVCard()).toContain(
      'ANNIVERSARY;CALSCALE=gregorian:20100615',
    )
  })

  it('should throw on v3 instance', () => {
    expect(() => new VCard().addAnniversary({ date: '2010-06-15' })).toThrow(
      VCardException,
    )
  })
})

describe('addGender()', () => {
  it('should emit GENDER:M for sex only', () => {
    const vCard = VCard.v4()
    vCard.addGender({ sex: 'M' })
    expect(vCard.buildVCard()).toContain('GENDER:M')
  })

  it('should emit GENDER:F for female', () => {
    expect(VCard.v4().addGender({ sex: 'F' }).buildVCard()).toContain(
      'GENDER:F',
    )
  })

  it('should emit GENDER:O;non-binary for sex and identity', () => {
    const vCard = VCard.v4()
    vCard.addGender({ sex: 'O', identity: 'non-binary' })
    expect(vCard.buildVCard()).toContain('GENDER:O;non-binary')
  })

  it('should emit GENDER: identity only when no sex given', () => {
    const vCard = VCard.v4()
    vCard.addGender({ identity: 'they/them' })
    expect(vCard.buildVCard()).toContain('GENDER:they/them')
  })

  it('should throw on duplicate GENDER', () => {
    const vCard = VCard.v4()
    vCard.addGender({ sex: 'M' })
    expect(() => vCard.addGender({ sex: 'F' })).toThrow(VCardException)
  })
})

describe('addLang()', () => {
  it('should emit LANG property with language tag', () => {
    const vCard = VCard.v4()
    vCard.addLang({ language: 'en' })
    expect(vCard.buildVCard()).toContain('LANG:en')
  })

  it('should emit PREF= param when provided', () => {
    const vCard = VCard.v4()
    vCard.addLang({ language: 'en', pref: 1 })
    expect(vCard.buildVCard()).toContain('LANG;PREF=1:en')
  })

  it('should emit TYPE= param when provided', () => {
    const vCard = VCard.v4()
    vCard.addLang({ language: 'fr', type: ['work'] })
    expect(vCard.buildVCard()).toContain('LANG;TYPE=WORK:fr')
  })

  it('should allow multiple LANG properties', () => {
    const vCard = VCard.v4()
    vCard.addLang({ language: 'en', pref: 1 })
    vCard.addLang({ language: 'fr', pref: 2 })
    const output = vCard.buildVCard()
    expect(output).toContain('LANG;PREF=1:en')
    expect(output).toContain('LANG;PREF=2:fr')
  })

  it('should throw on v3 instance', () => {
    expect(() => new VCard().addLang({ language: 'en' })).toThrow(
      VCardException,
    )
  })
})

describe('addMember()', () => {
  it('should emit MEMBER property with URI', () => {
    const vCard = VCard.v4()
    vCard.addMember('mailto:alice@example.com')
    expect(vCard.buildVCard()).toContain('MEMBER:mailto:alice@example.com')
  })

  it('should allow multiple MEMBER properties', () => {
    const vCard = VCard.v4()
    vCard.addMember('mailto:alice@example.com')
    vCard.addMember('mailto:bob@example.com')
    const output = vCard.buildVCard()
    expect(output).toContain('MEMBER:mailto:alice@example.com')
    expect(output).toContain('MEMBER:mailto:bob@example.com')
  })

  it('should throw on v3 instance', () => {
    expect(() => new VCard().addMember('mailto:x@x.com')).toThrow(
      VCardException,
    )
  })
})

describe('addRelated()', () => {
  it('should emit RELATED;VALUE=uri for a URI value', () => {
    const vCard = VCard.v4()
    vCard.addRelated({ value: 'mailto:alice@example.com' })
    expect(vCard.buildVCard()).toContain(
      'RELATED;VALUE=uri:mailto:alice@example.com',
    )
  })

  it('should emit RELATED without VALUE=uri for a non-URI value', () => {
    const vCard = VCard.v4()
    vCard.addRelated({ value: 'Alice Smith' })
    expect(vCard.buildVCard()).toContain('RELATED:Alice Smith')
  })

  it('should emit TYPE= param when provided', () => {
    const vCard = VCard.v4()
    vCard.addRelated({ value: 'mailto:alice@example.com', type: ['friend'] })
    expect(vCard.buildVCard()).toContain(
      'RELATED;VALUE=uri;TYPE=FRIEND:mailto:alice@example.com',
    )
  })

  it('should allow multiple RELATED properties', () => {
    const vCard = VCard.v4()
    vCard.addRelated({ value: 'mailto:a@example.com', type: ['friend'] })
    vCard.addRelated({ value: 'mailto:b@example.com', type: ['colleague'] })
    const output = vCard.buildVCard()
    expect(output).toContain('TYPE=FRIEND')
    expect(output).toContain('TYPE=COLLEAGUE')
  })

  it('should throw on v3 instance', () => {
    expect(() => new VCard().addRelated({ value: 'mailto:x@x.com' })).toThrow(
      VCardException,
    )
  })
})

describe('addClientPidMap()', () => {
  it('should emit CLIENTPIDMAP property', () => {
    const vCard = VCard.v4()
    vCard.addClientPidMap(1, 'urn:uuid:abcd-1234')
    expect(vCard.buildVCard()).toContain('CLIENTPIDMAP:1;urn:uuid:abcd-1234')
  })

  it('should allow multiple CLIENTPIDMAP entries', () => {
    const vCard = VCard.v4()
    vCard.addClientPidMap(1, 'urn:uuid:1111')
    vCard.addClientPidMap(2, 'urn:uuid:2222')
    const output = vCard.buildVCard()
    expect(output).toContain('CLIENTPIDMAP:1;urn:uuid:1111')
    expect(output).toContain('CLIENTPIDMAP:2;urn:uuid:2222')
  })

  it('should throw on v3 instance', () => {
    expect(() => new VCard().addClientPidMap(1, 'urn:uuid:test')).toThrow(
      VCardException,
    )
  })
})

describe('addFbUrl()', () => {
  it('should emit FBURL property', () => {
    const vCard = VCard.v4()
    vCard.addFbUrl('https://example.com/busy/ada')
    expect(vCard.buildVCard()).toContain('FBURL:https://example.com/busy/ada')
  })

  it('should allow multiple FBURL entries', () => {
    const vCard = VCard.v4()
    vCard.addFbUrl('https://example.com/a')
    vCard.addFbUrl('https://example.com/b')
    const output = vCard.buildVCard()
    expect(output).toContain('FBURL:https://example.com/a')
    expect(output).toContain('FBURL:https://example.com/b')
  })

  it('should throw on v3 instance', () => {
    expect(() => new VCard().addFbUrl('https://x.com')).toThrow(VCardException)
  })
})

describe('addCalAdrUri()', () => {
  it('should emit CALADRURI property', () => {
    const vCard = VCard.v4()
    vCard.addCalAdrUri('mailto:ada@example.com')
    expect(vCard.buildVCard()).toContain('CALADRURI:mailto:ada@example.com')
  })

  it('should throw on v3 instance', () => {
    expect(() => new VCard().addCalAdrUri('mailto:x@x.com')).toThrow(
      VCardException,
    )
  })
})

describe('addCalUri()', () => {
  it('should emit CALURI property', () => {
    const vCard = VCard.v4()
    vCard.addCalUri('https://example.com/cal/ada')
    expect(vCard.buildVCard()).toContain('CALURI:https://example.com/cal/ada')
  })

  it('should throw on v3 instance', () => {
    expect(() => new VCard().addCalUri('https://x.com/cal')).toThrow(
      VCardException,
    )
  })
})

// ── Phase 4: v4 params on existing properties ──────────────────────────────────

describe('addEmail() v4 params', () => {
  it('should emit PREF= param in v4', () => {
    const vCard = VCard.v4()
    vCard.addEmail({ address: 'ada@example.com', pref: 1 })
    expect(vCard.buildVCard()).toContain('EMAIL;PREF=1:ada@example.com')
  })

  it('should convert TYPE=pref to PREF=1 in v4', () => {
    const vCard = VCard.v4()
    vCard.addEmail({ address: 'ada@example.com', type: ['pref', 'work'] })
    const output = vCard.buildVCard()
    expect(output).toContain('PREF=1')
    expect(output).toContain('TYPE=WORK')
    expect(output).not.toContain('TYPE=PREF')
  })

  it('should emit ALTID= param in v4', () => {
    const vCard = VCard.v4()
    vCard.addEmail({ address: 'ada@example.com', altid: '1' })
    expect(vCard.buildVCard()).toContain('ALTID=1')
  })

  it('should emit PID= param in v4', () => {
    const vCard = VCard.v4()
    vCard.addEmail({ address: 'ada@example.com', pid: '1.1' })
    expect(vCard.buildVCard()).toContain('PID=1.1')
  })

  it('should ignore v4-only params in v3', () => {
    const vCard = new VCard()
    vCard.addEmail({ address: 'ada@example.com', pref: 1, altid: '1' })
    const output = vCard.buildVCard()
    expect(output).not.toContain('PREF=')
    expect(output).not.toContain('ALTID=')
  })
})

describe('addPhoneNumber() v4 params', () => {
  it('should default to VALUE=uri in v4', () => {
    const vCard = VCard.v4()
    vCard.addPhoneNumber({ number: '+1-555-0100' })
    expect(vCard.buildVCard()).toContain('TEL;VALUE=uri:+1-555-0100')
  })

  it('should emit VALUE=uri when explicitly set in v4', () => {
    const vCard = VCard.v4()
    vCard.addPhoneNumber({ number: 'tel:+1-555-0100', value: 'uri' })
    expect(vCard.buildVCard()).toContain('VALUE=uri')
  })

  it('should not emit VALUE=uri when value is text in v4', () => {
    const vCard = VCard.v4()
    vCard.addPhoneNumber({ number: 'John', value: 'text' })
    expect(vCard.buildVCard()).not.toContain('VALUE=uri')
  })

  it('should emit PREF= param in v4', () => {
    const vCard = VCard.v4()
    vCard.addPhoneNumber({ number: '+1-555-0100', pref: 1 })
    expect(vCard.buildVCard()).toContain('PREF=1')
  })

  it('should convert TYPE=pref to PREF=1 in v4', () => {
    const vCard = VCard.v4()
    vCard.addPhoneNumber({ number: '+1-555-0100', type: ['pref', 'work'] })
    const output = vCard.buildVCard()
    expect(output).toContain('PREF=1')
    expect(output).not.toContain('TYPE=PREF')
  })

  it('should not emit VALUE=uri in v3', () => {
    const vCard = new VCard()
    vCard.addPhoneNumber({ number: '+1-555-0100' })
    expect(vCard.buildVCard()).not.toContain('VALUE=uri')
  })
})

describe('addAddress() v4 params', () => {
  it('should emit PREF= param in v4', () => {
    const vCard = VCard.v4()
    vCard.addAddress({ street: '1 Main St', pref: 1 })
    expect(vCard.buildVCard()).toContain('PREF=1')
  })

  it('should convert TYPE=pref to PREF=1 in v4', () => {
    const vCard = VCard.v4()
    vCard.addAddress({ street: '1 Main St', type: ['pref', 'work'] })
    const output = vCard.buildVCard()
    expect(output).toContain('PREF=1')
    expect(output).not.toContain('TYPE=PREF')
  })

  it('should emit LABEL= param in v4', () => {
    const vCard = VCard.v4()
    vCard.addAddress({
      street: '1 Main St',
      label: '1 Main St\nBoston, MA 01234',
    })
    expect(vCard.buildVCard()).toContain('LABEL=')
  })

  it('should emit GEO= param in v4', () => {
    const vCard = VCard.v4()
    vCard.addAddress({ street: '1 Main St', geo: 'geo:42.3,-71.0' })
    expect(vCard.buildVCard()).toContain('GEO="geo:42.3,-71.0"')
  })

  it('should emit TZ= param in v4', () => {
    const vCard = VCard.v4()
    vCard.addAddress({ street: '1 Main St', tz: 'America/New_York' })
    expect(vCard.buildVCard()).toContain('TZ="America/New_York"')
  })

  it('should strip obsolete default ADR types (intl, postal, parcel) in v4', () => {
    const vCard = VCard.v4()
    vCard.addAddress({ street: '1 Main St' })
    const output = vCard.buildVCard()
    expect(output).not.toContain('TYPE=INTL')
    expect(output).not.toContain('TYPE=POSTAL')
    expect(output).not.toContain('TYPE=PARCEL')
  })

  it('should retain work type in v4 when stripping obsolete types', () => {
    const vCard = VCard.v4()
    vCard.addAddress({ street: '1 Main St' })
    expect(vCard.buildVCard()).toContain('TYPE=WORK')
  })
})

describe('addUrl() v4 params', () => {
  it('should emit PREF= param in v4', () => {
    const vCard = VCard.v4()
    vCard.addUrl({ url: 'https://example.com', pref: 1 })
    expect(vCard.buildVCard()).toContain('PREF=1')
  })

  it('should emit MEDIATYPE= param in v4', () => {
    const vCard = VCard.v4()
    vCard.addUrl({ url: 'https://example.com', mediaType: 'text/html' })
    expect(vCard.buildVCard()).toContain('MEDIATYPE=text/html')
  })

  it('should ignore v4 params in v3', () => {
    const vCard = new VCard()
    vCard.addUrl({ url: 'https://example.com', pref: 1 })
    expect(vCard.buildVCard()).not.toContain('PREF=')
  })
})

describe('addImpp() v4 params', () => {
  it('should emit PREF= param in v4', () => {
    const vCard = VCard.v4()
    vCard.addImpp({ uri: 'xmpp:alice@example.com', pref: 1 })
    expect(vCard.buildVCard()).toContain('PREF=1')
  })

  it('should emit PID= param in v4', () => {
    const vCard = VCard.v4()
    vCard.addImpp({ uri: 'xmpp:alice@example.com', pid: '1.1' })
    expect(vCard.buildVCard()).toContain('PID=1.1')
  })
})

describe('addName() v4 SORT-AS param', () => {
  it('should emit SORT-AS param on N key when sortAs is provided', () => {
    const vCard = VCard.v4()
    vCard.addName({ familyName: 'Doe', givenName: 'Jane', sortAs: 'Doe,Jane' })
    expect(vCard.buildVCard()).toContain('N;SORT-AS="Doe,Jane":')
  })

  it('should not emit SORT-AS in v3', () => {
    const vCard = new VCard()
    vCard.addName({
      familyName: 'Doe',
      givenName: 'Jane',
      sortAs: 'Doe,Jane',
    } as Parameters<typeof vCard.addName>[0])
    expect(vCard.buildVCard()).not.toContain('SORT-AS')
  })
})

describe('addCompany() v4 SORT-AS param', () => {
  it('should emit SORT-AS param on ORG key in v4', () => {
    const vCard = VCard.v4()
    vCard.addCompany({ name: 'Example Inc.', sortAs: 'Example' })
    expect(vCard.buildVCard()).toContain('ORG;SORT-AS="Example":Example Inc.')
  })

  it('should not emit SORT-AS on ORG in v3', () => {
    const vCard = new VCard()
    vCard.addCompany({ name: 'Example Inc.', sortAs: 'Example' } as Parameters<
      typeof vCard.addCompany
    >[0])
    expect(vCard.buildVCard()).not.toContain('SORT-AS')
  })
})

describe('addPhoto() and addLogo() v4 params', () => {
  it('should emit MEDIATYPE= param on PHOTO;VALUE=uri in v4', () => {
    const vCard = VCard.v4()
    vCard.addPhoto({
      url: 'https://example.com/photo.jpg',
      mediaType: 'image/jpeg',
    })
    expect(vCard.buildVCard()).toContain(
      'PHOTO;VALUE=uri;MEDIATYPE=image/jpeg:',
    )
  })

  it('should not emit MEDIATYPE= in v3', () => {
    const vCard = new VCard()
    vCard.addPhoto({
      url: 'https://example.com/photo.jpg',
      mediaType: 'image/jpeg',
    } as Parameters<typeof vCard.addPhoto>[0])
    expect(vCard.buildVCard()).not.toContain('MEDIATYPE=')
  })

  it('should emit MEDIATYPE= param on LOGO;VALUE=uri in v4', () => {
    const vCard = VCard.v4()
    vCard.addLogo({
      url: 'https://example.com/logo.png',
      mediaType: 'image/png',
    })
    expect(vCard.buildVCard()).toContain('LOGO;VALUE=uri;MEDIATYPE=image/png:')
  })
})

describe('addKey() v4 MEDIATYPE param', () => {
  it('should emit MEDIATYPE= on KEY;VALUE=uri in v4', () => {
    const vCard = VCard.v4()
    vCard.addKey({
      url: 'https://example.com/key.asc',
      mediaType: 'application/pgp-keys',
    })
    expect(vCard.buildVCard()).toContain(
      'KEY;VALUE=uri;MEDIATYPE=application/pgp-keys:',
    )
  })

  it('should not emit MEDIATYPE= in v3', () => {
    const vCard = new VCard()
    vCard.addKey({
      url: 'https://example.com/key.asc',
      mediaType: 'application/pgp-keys',
    } as Parameters<typeof vCard.addKey>[0])
    expect(vCard.buildVCard()).not.toContain('MEDIATYPE=')
  })
})

// ── v4 group prefix support ────────────────────────────────────────────────────

describe('group prefix (useGroups)', () => {
  it('should emit group prefix on addEmail when useGroups is true', () => {
    const vCard = new VCard({ version: 4, useGroups: true })
    vCard.addEmail({ address: 'ada@example.com', group: 'item1' })
    expect(vCard.buildVCard()).toContain('item1.EMAIL')
  })

  it('should not emit group prefix when useGroups is false', () => {
    const vCard = VCard.v4()
    vCard.addEmail({ address: 'ada@example.com', group: 'item1' })
    expect(vCard.buildVCard()).not.toContain('item1.')
  })
})

// ── v4 full round-trip ─────────────────────────────────────────────────────────

describe('v4 full round-trip', () => {
  it('should produce a valid RFC 6350 vCard 4.0 with multiple v4-specific properties', () => {
    const vCard = VCard.v4()
    vCard
      .addName({ familyName: 'Lovelace', givenName: 'Ada' })
      .addGender({ sex: 'F' })
      .addKind('individual')
      .addAnniversary({ date: '18351010' })
      .addLang({ language: 'en', pref: 1 })
      .addSource('ldap://example.com/cn=Ada')
      .addRelated({ value: 'mailto:charles@example.com', type: ['friend'] })
      .addCalUri('https://example.com/cal/ada')

    const output = vCard.buildVCard()
    expect(output).toContain('BEGIN:VCARD')
    expect(output).toContain('VERSION:4.0')
    expect(output).toContain('N:Lovelace;Ada;;;')
    expect(output).toContain('GENDER:F')
    expect(output).toContain('KIND:individual')
    expect(output).toContain('ANNIVERSARY:18351010')
    expect(output).toContain('LANG;PREF=1:en')
    expect(output).toContain('SOURCE:ldap://example.com/cn=Ada')
    expect(output).toContain(
      'RELATED;VALUE=uri;TYPE=FRIEND:mailto:charles@example.com',
    )
    expect(output).toContain('CALURI:https://example.com/cal/ada')
    expect(output).toContain('END:VCARD')
  })
})
