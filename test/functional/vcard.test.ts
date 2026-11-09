import { describe, expect, it } from 'vitest'
import VCard from '../../dist/index.js'
import { sampleImage as photo } from '../fixtures'

const createCard = () =>
  new VCard()
    .addName({
      givenName: 'Jeroen',
      familyName: 'Desloovere',
      honorificPrefix: 'Mr.',
    })
    .addNickname(['JD', 'Jero'])
    .addBirthday('1990-05-15')
    .addCompany({ name: 'Siesqo', department: 'Engineering' })
    .addJobtitle('Web Developer')
    .addRole('Data Protection Officer')
    .addEmail({ address: 'info@jeroendesloovere.be', type: ['pref', 'work'] })
    .addEmail({ address: 'jeroen@personal.be', type: ['home'] })
    .addPhoneNumber({ number: '+32 123 456 789', type: ['work', 'voice'] })
    .addPhoneNumber({ number: '+32 987 654 321', type: ['cell'] })
    .addAddress({
      street: 'Kerkstraat 1',
      locality: 'Ghent',
      region: 'East Flanders',
      postalCode: '9000',
      country: 'Belgium',
      type: ['work'],
    })
    .addAddress({
      street: 'Homestraat 42',
      locality: 'Brussels',
      postalCode: '1000',
      country: 'Belgium',
      type: ['home'],
    })
    .addLabel({ label: 'Kerkstraat 1\n9000 Ghent\nBelgium', type: ['work'] })
    .addUrl({ url: 'http://www.jeroendesloovere.be', type: ['work'] })
    .addSocial({
      url: 'https://x.com/desloovere_j',
      type: 'X',
      user: 'desloovere_j',
    })
    .addSocial({
      url: 'https://linkedin.com/in/desloovere',
      type: 'LinkedIn',
    })
    .addGeo({ latitude: 51.0543, longitude: 3.7174 })
    .addTimezone('Europe/Brussels')
    .addNote('Met at vCard conference; loves open-source, Belgian waffles')
    .addCategories(['Developer', 'Open Source'])
    .addSortString('Desloovere')
    .addPhoto({ image: photo, mime: 'jpeg' })
    .addLogo({ url: 'https://example.com/siesqo-logo.png' })
    .addCustomProperty({
      name: 'X-PHONETIC-FIRST-NAME',
      value: 'Yeroon',
    })
    .addCustomProperty({
      name: 'TEL',
      value: '+32 555 000 111',
      group: 'item1',
    })
    .addCustomProperty({
      name: 'X-ABLabel',
      value: 'Reception',
      group: 'item1',
    })

const createSecondCard = () =>
  new VCard()
    .addFullName('Alice from Wonderland')
    .addName({ givenName: 'Alice', familyName: 'Wonderland' })
    .addEmail({ address: 'alice@wonderland.com', type: ['pref'] })
    .addPhoneNumber({ number: '+1 555 000 111', type: ['cell'] })
    .addCompany({ name: 'Looking Glass Inc.' })
    .addUrl({ url: 'https://alice.wonderland.com' })
    .addKey({ url: 'https://alice.wonderland.com/pgp.pub' })

describe('single contact', () => {
  const output = createCard().toString()

  it.each([
    ['vCard header', 'BEGIN:VCARD'],
    ['version', 'VERSION:3.0'],
    ['structured name', 'N:Desloovere;Jeroen;;Mr.;'],
    ['formatted name', 'FN:Mr. Jeroen Desloovere'],
    ['birthday', 'BDAY:1990-05-15'],
    ['organization', 'ORG:Siesqo;Engineering'],
    ['IMPP from social', 'IMPP;X-SERVICE-TYPE=X'],
    ['escaped semicolon in note', 'NOTE:Met at vCard conference\\;'],
    ['grouped property', 'item1.TEL:+32 555 000 111'],
    ['grouped label', 'item1.X-ABLABEL:Reception'],
    ['embedded photo', 'PHOTO;ENCODING=b;TYPE=JPEG:'],
    ['logo URL', 'LOGO;VALUE=uri:https://example.com/siesqo-logo.png'],
    ['geographic position', 'GEO:51.0543;3.7174'],
    ['IANA time zone', 'TZ;VALUE=text:Europe/Brussels'],
    ['vCard footer', 'END:VCARD'],
  ])('should write the %s', (_, marker) => {
    expect(output).toContain(marker)
  })
})

describe('multiple contacts', () => {
  const output = createCard().concat(createSecondCard())

  it('should start and end with a vCard boundary', () => {
    expect(output.startsWith('BEGIN:VCARD')).toBe(true)
    expect(output.endsWith('END:VCARD\r\n')).toBe(true)
  })

  it('should contain 2 vCards', () => {
    expect(output.match(/BEGIN:VCARD/g)).toHaveLength(2)
    expect(output.match(/END:VCARD/g)).toHaveLength(2)
  })

  it('should write the custom FN of the second card in place of the generated one', () => {
    expect(output).toContain('FN:Mr. Jeroen Desloovere')
    expect(output).toContain('FN:Alice from Wonderland')
    expect(output).not.toContain('FN:Alice Wonderland')
  })

  it('should write the key URL of the second card', () => {
    expect(output).toContain(
      'KEY;VALUE=uri:https://alice.wonderland.com/pgp.pub',
    )
  })

  it('should write the first card before the second', () => {
    expect(output.indexOf('FN:Mr. Jeroen Desloovere')).toBeLessThan(
      output.indexOf('FN:Alice from Wonderland'),
    )
  })
})
