# vcard-creator
[![npm version](https://badge.fury.io/js/vcard-creator.svg)](https://badge.fury.io/js/vcard-creator)

A JavaScript vCard creator library for both node.js and the web. Outputs the
vCard text that should be saved as a \*.vcf file.

## Origin
This is based on jeroendesloovere's
[vcard](https://github.com/jeroendesloovere/vcard) for PHP.

## Installation

```bash
$ npm install --save vcard-creator
```

## Example

```javascript
var { vCard } = require('vcard-creator')

// define vcard
var vcard = new vCard()

// define variables
var lastname = 'Desloovere'
var firstname = 'Jeroen'
var additional = ''
var prefix = ''
var suffix = ''

// add personal data
vcard.addName(lastname, firstname, additional, prefix, suffix)

// add work data
vcard.addCompany('Siesqo')
vcard.addJobtitle('Web Developer')
vcard.addRole('Data Protection Officer')
vcard.addEmail('info@jeroendesloovere.be')
vcard.addPhoneNumber(1234121212, 'PREF;WORK')
vcard.addPhoneNumber(123456789, 'WORK')
vcard.addAddress(null, null, 'street', 'worktown', null, 'workpostcode', 'Belgium')
vcard.addURL('http://www.jeroendesloovere.be')

console.log(vcard.toString())
```

Output
```
BEGIN:VCARD
VERSION:3.0
REV:2017-08-31T17:00:15.850Z
N;CHARSET=utf-8:Desloovere;Jeroen;;;
FN;CHARSET=utf-8:Jeroen Desloovere
ORG;CHARSET=utf-8:Siesqo
TITLE;CHARSET=utf-8:Web Developer
ROLE;CHARSET=utf-8:Data Protection Officer
EMAIL;INTERNET:info@jeroendesloovere.be
TEL;PREF;WORK:1234121212
TEL;WORK:123456789
ADR;WORK;POSTAL;CHARSET=utf-8:name;extended;street;worktown;state;workpos
 tcode;Belgium
URL:http://www.jeroendesloovere.be
END:VCARD
```
