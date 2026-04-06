#!/usr/bin/env node
import VCard from '../dist/esm/index.js'

const vCard = new VCard()

vCard
  .addName({ givenName: 'Jeroen', familyName: 'Desloovere' })
  .addCompany({ name: 'Siesqo' })
  .addEmail({ address: 'info@jeroendesloovere.be' })
  .addSocial({
    url: 'https://x.com/desloovere_j',
    type: 'X',
    user: 'desloovere_j',
  })
  .addUrl({ url: 'http://www.jeroendesloovere.be' })

const output = vCard.toString()

if (!output.includes('BEGIN:VCARD')) {
  console.error('ESM functional test FAILED: output missing BEGIN:VCARD')
  process.exit(1)
}

if (!output.includes('IMPP;X-SERVICE-TYPE=X')) {
  console.error('ESM functional test FAILED: output missing IMPP property')
  process.exit(1)
}

console.log(output)
