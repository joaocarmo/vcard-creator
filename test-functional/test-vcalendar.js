#!/usr/bin/env node
var VCard = require('../dist/vcard-creator').default

// define vCard
var vCard = new VCard('vcalendar')

// define variables
var lastname = 'Desloovere'
var firstname = 'Jeroen'
var additional = ''
var prefix = ''
var suffix = ''

vCard
  // add personal data
  .addName(lastname, firstname, additional, prefix, suffix)
  // add work data
  .addCompany('Siesqo')
  .addJobtitle('Web Developer')
  .addRole('Data Protection Officer')
  .addEmail('info@jeroendesloovere.be')
  .addPhoneNumber(1234121212, 'PREF;WORK')
  .addPhoneNumber(123456789, 'WORK')
  .addAddress(
    'name',
    'extended',
    'street',
    'worktown',
    'state',
    'workpostcode',
    'Belgium',
  )
  .addURL('http://www.jeroendesloovere.be')
  .addPhotoURL(
    'https://cdn.jsdelivr.net/gh/joaocarmo/vcard-creator@master/lib/__tests__/assets/sample.jpg',
  )

console.log(vCard.toString())
