#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import VCard from '../dist/index.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const photo = readFileSync(join(__dirname, '../lib/assets/sample.jpg'), {
  encoding: 'base64',
})

const vCard = new VCard()

vCard
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
  .addGeo(51.0543, 3.7174)
  .addTimezone('Europe/Brussels')
  .addNote('Met at vCard conference; loves open-source, Belgian waffles')
  .addCategories(['Developer', 'Open Source'])
  .addSortString('Desloovere')
  .addPhoto({ image: photo, mime: 'jpeg' })
  .addLogoUrl({ url: 'https://example.com/siesqo-logo.png' })
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

const output = vCard.toString()

// Validate key markers
const checks = [
  ['BEGIN:VCARD', 'vCard header'],
  ['VERSION:3.0', 'version'],
  ['N:Desloovere;Jeroen;;Mr.;', 'structured name'],
  ['FN:Mr. Jeroen Desloovere', 'formatted name'],
  ['BDAY:1990-05-15', 'birthday'],
  ['ORG:Siesqo;Engineering', 'organization'],
  ['IMPP;X-SERVICE-TYPE=X', 'IMPP from social'],
  ['NOTE:Met at vCard conference\\;', 'escaped semicolon in note'],
  ['item1.TEL:+32 555 000 111', 'grouped property'],
  ['item1.X-ABLABEL:Reception', 'grouped label'],
  ['PHOTO;ENCODING=b;TYPE=JPEG:', 'embedded photo'],
  ['LOGO;VALUE=uri:https://example.com/siesqo-logo.png', 'logo URL'],
  ['GEO:51.0543;3.7174', 'geographic position'],
  ['END:VCARD', 'vCard footer'],
]

for (const [marker, label] of checks) {
  if (!output.includes(marker)) {
    console.error(`Functional test FAILED: missing ${label} (${marker})`)
    process.exit(1)
  }
}

console.log(output)

const card2 = new VCard()
  .addName({ givenName: 'Alice', familyName: 'Wonderland' })
  .addEmail({ address: 'alice@wonderland.com', type: ['pref'] })
  .addPhoneNumber({ number: '+1 555 000 111', type: ['cell'] })
  .addCompany({ name: 'Looking Glass Inc.' })
  .addUrl({ url: 'https://alice.wonderland.com' })

const multiOutput = vCard.concat(card2)

const multiChecks = [
  [multiOutput.startsWith('BEGIN:VCARD'), 'starts with BEGIN:VCARD'],
  [multiOutput.endsWith('END:VCARD\r\n'), 'ends with END:VCARD'],
  [
    (multiOutput.match(/BEGIN:VCARD/g) || []).length === 2,
    'contains 2 BEGIN:VCARD markers',
  ],
  [
    (multiOutput.match(/END:VCARD/g) || []).length === 2,
    'contains 2 END:VCARD markers',
  ],
  [multiOutput.includes('FN:Mr. Jeroen Desloovere'), 'card1 FN present'],
  [multiOutput.includes('FN:Alice Wonderland'), 'card2 FN present'],
  [
    multiOutput.indexOf('FN:Mr. Jeroen Desloovere') <
      multiOutput.indexOf('FN:Alice Wonderland'),
    'card1 appears before card2',
  ],
]

for (const [passed, label] of multiChecks) {
  if (!passed) {
    console.error(`Multi-contact test FAILED: ${label}`)
    process.exit(1)
  }
}

writeFileSync(join(__dirname, '../vcard-multi.vcf'), multiOutput)
console.error('Multi-contact test PASSED → vcard-multi.vcf')
