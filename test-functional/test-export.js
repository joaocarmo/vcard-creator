// define vcard
var VCard = window.vcardcreator.default;
var vcard = new VCard();

// define variables
var lastname = 'Desloovere';
var firstname = 'Jeroen';
var additional = '';
var prefix = '';
var suffix = '';

// add personal data
vcard.addName(lastname, firstname, additional, prefix, suffix);

// add work data
vcard.addCompany('Siesqo');
vcard.addJobtitle('Web Developer');
vcard.addRole('Data Protection Officer');
vcard.addEmail('info@jeroendesloovere.be');
vcard.addPhoneNumber(1234121212, 'PREF;WORK');
vcard.addPhoneNumber(123456789, 'WORK');
vcard.addAddress('name', 'extended', 'street', 'worktown', 'state', 'workpostcode', 'Belgium');
vcard.addURL('http://www.jeroendesloovere.be');

var output = vcard.toString();

console.log(output);

document.getElementById('vcard').innerHTML = output;
