// Runs the built package on the oldest supported Node.js versions, where
// Vitest does not run. Needs `pnpm build` first.
import assert from 'node:assert/strict'
import VCard, { VCardException } from '../../dist/index.js'

const { NODE_MAJOR } = process.env

if (NODE_MAJOR) {
  assert.ok(
    process.versions.node.startsWith(`${NODE_MAJOR}.`),
    `expected Node.js ${NODE_MAJOR}, got ${process.version}`,
  )
}

const output = new VCard()
  .addName({ givenName: 'Jeroen', familyName: 'Desloovere' })
  .addEmail({ address: 'info@jeroendesloovere.be', type: ['work'] })
  .addPhoneNumber({ number: '+32 123 456 789', type: ['cell'] })
  .addAddress({ street: 'Kerkstraat 1', locality: 'Ghent', type: ['work'] })
  .addPhoto({ image: 'R0lGODlhAQABAAAAACw=', mime: 'gif' })
  .addGeo({ latitude: 51.0543, longitude: 3.7174 })
  .addNote('Loves open-source; Belgian waffles')
  .toString()

assert.ok(output.startsWith('BEGIN:VCARD\r\n'), 'missing vCard header')
assert.ok(output.endsWith('END:VCARD\r\n'), 'missing vCard footer')

for (const line of [
  'N:Desloovere;Jeroen;;;',
  'FN:Jeroen Desloovere',
  'EMAIL;TYPE=WORK:info@jeroendesloovere.be',
  'TEL;TYPE=CELL:+32 123 456 789',
  'ADR;TYPE=WORK:;;Kerkstraat 1;Ghent;;;',
  'PHOTO;ENCODING=b;TYPE=GIF:R0lGODlhAQABAAAAACw=',
  'GEO:51.0543;3.7174',
  'NOTE:Loves open-source\\; Belgian waffles',
]) {
  assert.ok(output.includes(`\r\n${line}\r\n`), `missing line: ${line}`)
}

assert.throws(
  () => new VCard().addGeo({ latitude: 100, longitude: 0 }),
  VCardException,
)

console.log(`Smoke test passed on Node.js ${process.version}`)
