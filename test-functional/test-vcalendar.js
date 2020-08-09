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

// add personal data
vCard.addName(lastname, firstname, additional, prefix, suffix)

// add work data
vCard.addCompany('Siesqo')
vCard.addJobtitle('Web Developer')
vCard.addRole('Data Protection Officer')
vCard.addEmail('info@jeroendesloovere.be')
vCard.addPhoneNumber(1234121212, 'PREF;WORK')
vCard.addPhoneNumber(123456789, 'WORK')
vCard.addAddress('name', 'extended', 'street', 'worktown', 'state', 'workpostcode', 'Belgium')
vCard.addURL('http://www.jeroendesloovere.be')

console.log(vCard.toString())
