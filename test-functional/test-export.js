// define vcard
var VCard = window.vcardcreator.default
var vcard = new VCard()

// define variables
var lastname = 'Desloovere'
var firstname = 'Jeroen'
var additional = ''
var prefix = ''
var suffix = ''

// add personal data
vcard
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
  .addPhoto('https://live.staticflickr.com/65535/51059209772_bf41a28c7e_q.jpg')

var output = vcard.toString()

console.log(output)

document.getElementById('vcard').innerHTML = output
