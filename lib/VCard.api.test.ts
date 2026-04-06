import { vi } from 'vitest'
import VCard from './VCard'
import { resolveType } from './utils/functions'

describe('Object params API', () => {
  it('addName with options object', () => {
    const vCard = new VCard()
    vCard.addName({
      givenName: 'John',
      familyName: 'Doe',
      honorificPrefix: 'Dr.',
    })
    const output = vCard.toString()
    expect(output).toContain('N:Doe;John;;Dr.;')
    expect(output).toContain('FN:Dr. John Doe')
  })

  it('addAddress with options and typed array', () => {
    const vCard = new VCard()
    vCard.addAddress({
      street: '123 Main St',
      locality: 'Springfield',
      region: 'IL',
      postalCode: '62701',
      country: 'USA',
      type: ['home', 'postal'],
    })
    const output = vCard.toString()
    expect(output).toContain('ADR;TYPE=HOME,POSTAL:')
    expect(output).toContain('123 Main St;Springfield;IL;62701;USA')
  })

  it('addAddress with default type', () => {
    const vCard = new VCard()
    vCard.addAddress({ street: '123 Main St' })
    expect(vCard.toString()).toContain('ADR;TYPE=WORK,POSTAL:')
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
    expect(vCard.toString()).toContain('ORG:Acme Corp;Engineering')
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

  it('addPhoto with url option', () => {
    const vCard = new VCard()
    vCard.addPhoto({ url: 'https://example.com/photo.jpg' })
    expect(vCard.toString()).toContain(
      'PHOTO;VALUE=uri:https://example.com/photo.jpg',
    )
  })

  it('addLogo with url option', () => {
    const vCard = new VCard()
    vCard.addLogo({ url: 'https://example.com/logo.png' })
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
      'LABEL;TYPE=HOME:123 Main St\\nSpringfield',
    )
  })

  it('addLabel with options, default type', () => {
    const vCard = new VCard()
    vCard.addLabel({ label: 'Work address' })
    expect(vCard.toString()).toContain('LABEL;TYPE=WORK,POSTAL:Work address')
  })
})

describe('resolveType wire format', () => {
  it('typed array produces TYPE= format', () => {
    const vCard = new VCard()
    vCard.addPhoneNumber({ number: '123', type: ['work', 'voice'] })
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
    expect(vCard.toString()).toContain('ADR:')
    expect(vCard.toString()).not.toContain('TYPE=')
  })

  it('resolveType with single element', () => {
    expect(resolveType(['work'])).toBe('TYPE=WORK')
  })

  it('resolveType with multiple elements', () => {
    expect(resolveType(['work', 'postal'])).toBe('TYPE=WORK,POSTAL')
  })

  it('resolveType with empty array', () => {
    expect(resolveType([])).toBe('')
  })
})

describe('Empty FN guard', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date())
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should not generate FN when all name components are empty', () => {
    const vCard = new VCard()
    vCard.addName({})
    const output = vCard.toString()
    expect(output).toContain('N:;;;;')
    expect(output).not.toContain('FN:')
  })

  it('should still generate FN when name has components', () => {
    const vCard = new VCard()
    vCard.addName({ givenName: 'John' })
    const output = vCard.toString()
    expect(output).toContain('FN:John')
  })
})
