import VCard from '..'

// define vcard
var vcard = new VCard()

// define variables
var lastname = 'Desloovere'
var firstname = 'Jeroen'
var additional = ''
var prefix = ''
var suffix = ''

vcard
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

var output = vcard.toString()

console.log(output)

document.getElementById('vcard').innerHTML = output
