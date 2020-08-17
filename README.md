# vcard-creator

[![npm version](https://badge.fury.io/js/vcard-creator.svg)](https://badge.fury.io/js/vcard-creator)
[![jest](https://jestjs.io/img/jest-badge.svg)](https://github.com/facebook/jest)
![tests](https://github.com/joaocarmo/vcard-creator/workflows/Tests/badge.svg)

A JavaScript vCard 3.0 creator library for both node.js and the web.
It outputs the vCard text that should be saved as a `*.vcf` file.

## Origin

This is based on _jeroendesloovere_'s
[vCard](https://github.com/jeroendesloovere/vcard) for PHP.

## Installation

```sh
yarn add vcard-creator

# or

npm install vcard-creator
```

## Usage

### On the web

It's exposed through the _window_ global object as explained below.

`index.html`

```html
<head>
  <script type="text/javascript" src="./js/vcard-creator.js"></script>
  <script type="text/javascript" src="./js/main.js"></script>
</head>
```

`main.js`

```js
// define vCard
var VCard = window.vcardcreator.default;
var myVCard = new VCard();

// ...
```

### With a bundler / Node.js

With a bundler (e.g. webpack) or in Node.js you can just require / import it.

```js
var VCard = require('vcard-creator').default

// define a new vCard
var myVCard = new VCard()
```

Or in ES6 syntax...

```js
import VCard from 'vcard-creator'

// define vCard
const myVCard = new VCard()
```

### iCalendar format

For Apple devices that don't support the `vcf` file format, there is a
workaround. Specify the format of the output as `vcalendar` and then save it
with a `ics` file extension instead.

The trick is to create an iCalendar file with a vCard attached.

```js
// define a new vCard as 'vcalendar'
var myVCalendar = new VCard('vcalendar')

// or set it afterwards
var myOtherVCalendar = new VCard()
myOtherVCalendar.setFormat('vcalendar')
```

## Example

Code

```js
var VCard = require('vcard-creator').default

// define a new vCard
var myVCard = new VCard()

// define variables
var lastname = 'Desloovere'
var firstname = 'Jeroen'
var additional = ''
var prefix = ''
var suffix = ''

myVCard
  // add personal data
  .addName(lastname, firstname, additional, prefix, suffix)
  // add work data
  .addCompany('Siesqo')
  .addJobtitle('Web Developer')
  .addRole('Data Protection Officer')
  .addEmail('info@jeroendesloovere.be')
  .addPhoneNumber(1234121212, 'PREF;WORK')
  .addPhoneNumber(123456789, 'WORK')
  .addAddress(null, null, 'street', 'worktown', null, 'workpostcode', 'Belgium')
  .addURL('http://www.jeroendesloovere.be')

console.log(myVCard.toString())
```

Output

```txt
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

```sh
# Build
yarn build

# Test
yarn test:unit

yarn test:functional

yarn test:web-build

yarn test:web-export
```
