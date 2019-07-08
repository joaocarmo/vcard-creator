# vcard-creator
[![npm version](https://badge.fury.io/js/vcard-creator.svg)](https://badge.fury.io/js/vcard-creator)

A JavaScript vCard 3.0 creator library for both node.js and the web.
It outputs the vCard text that should be saved as a `*.vcf` file.

## Origin
This is based on _jeroendesloovere_'s
[vCard](https://github.com/jeroendesloovere/vcard) for PHP.

## Installation

```
$ npm install vcard-creator
```

## Usage

#### On the web

It's exposed through the _window_ global object as explained below.

`index.html`
```html
<head>
  <script type="text/javascript" src="./js/vcard-creator.js"></script>
  <script type="text/javascript" src="./js/foo.js"></script>
</head>
```

`foo.js`
```javascript
// define vCard
var VCard = window.vcardcreator.default;
var myVCard = new VCard();

// ...
```

#### With a bundler / Node.js

With a bundler (e.g. webpack) or in Node.js you can just require / import it.

```javascript
var VCard = require('vcard-creator')

// define a new vCard
var myVCard = new VCard()
```

Or in ES6 syntax...

```javascript
import VCard from 'vcard-creator'

// define vCard
const myVCard = new VCard()
```

## Example

```javascript
var VCard = require('vcard-creator')

// define a new vCard
var myVCard = new VCard()

// define variables
var lastname = 'Desloovere'
var firstname = 'Jeroen'
var additional = ''
var prefix = ''
var suffix = ''

// add personal data
vcard.addName(lastname, firstname, additional, prefix, suffix)

// add work data
myVCard.addCompany('Siesqo')
myVCard.addJobtitle('Web Developer')
myVCard.addRole('Data Protection Officer')
myVCard.addEmail('info@jeroendesloovere.be')
myVCard.addPhoneNumber(1234121212, 'PREF;WORK')
myVCard.addPhoneNumber(123456789, 'WORK')
myVCard.addAddress(null, null, 'street', 'worktown', null, 'workpostcode', 'Belgium')
myVCard.addURL('http://www.jeroendesloovere.be')

console.log(myVCard.toString())
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

## Forking / Contributing

If you're interested in the development of this project, you can run some ready
to use commands to compile and test your changes.

```
$ npm run build

$ npm test

$ npm run test-web-build

$ npm run test-web-export
```
