# vcard-creator

[![npm version](https://badge.fury.io/js/vcard-creator.svg)](https://badge.fury.io/js/vcard-creator)
[![jest](https://jestjs.io/img/jest-badge.svg)](https://github.com/facebook/jest)
![tests](https://github.com/joaocarmo/vcard-creator/workflows/Tests/badge.svg)

A JavaScript vCard 3.0 creator library for both node.js and the web.
It outputs the vCard text that should be saved as a `*.vcf` file.

## Origin

This is based on _jeroendesloovere_'s [vCard][jeroendesloovere] for PHP.

## Installation

```sh
pnpm add vcard-creator

# or

npm install vcard-creator
```

## Usage

### As an ESM module (web)

Load **vcard-creator** directly from [skypack][skypack] (CDN).

```html
<script type="module">
  import VCard from 'https://cdn.skypack.dev/vcard-creator'
</script>
```

Demo available in [codepen][codepen].

### On the web (self-hosted)

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
// Define a new vCard
var VCard = window.vcardcreator.default
var myVCard = new VCard()

// ...rest of the code
```

### With a bundler / Node.js

With a bundler (e.g. webpack) or in Node.js you can just require / import it.

```js
const VCard = require('vcard-creator').default

// Define a new vCard
const myVCard = new VCard()
```

Or...

```js
import VCard from 'vcard-creator'

// Define a new vCard
const myVCard = new VCard()
```

### Including an image

You need to provide the image already properly encoded (base64). Note that most
applications will probably ignore a photo URL, even if it adheres to the
specification.

```js
// Example in Node.js

const fs = require('fs')
const VCard = require('vcard-creator').default

const imagePath = './path/to/my/assets/sample.jpg'
const image = fs.readFileSync(imagePath, { encoding: 'base64', flag: 'r' })

const vCard = new VCard()

vCard.addPhoto(image, 'JPEG')
```

Include the proper [MIME type][mime-types] (defaults to `JPEG`).

### [DEPRECATED] iCalendar format

For Apple devices that don't support the `vcf` file format, there is a
workaround. Specify the format of the output as `vcalendar` and then save it
with a `ics` file extension instead.

The trick is to create an iCalendar file with a vCard attached.

```js
// Define a new vCard as 'vcalendar'
const myVCalendar = new VCard('vcalendar')

// ...or set it afterwards
const myOtherVCalendar = new VCard()
myOtherVCalendar.setFormat('vcalendar')
```

## Example

```js
import VCard from 'vcard-creator'

// Define a new vCard
const myVCard = new VCard()

// Some variables
const lastname = 'Desloovere'
const firstname = 'Jeroen'
const additional = ''
const prefix = ''
const suffix = ''

myVCard
  // Add personal data
  .addName(lastname, firstname, additional, prefix, suffix)
  // Add work data
  .addCompany('Siesqo')
  .addJobtitle('Web Developer')
  .addRole('Data Protection Officer')
  .addEmail('info@jeroendesloovere.be')
  .addPhoneNumber(1234121212, 'PREF;WORK')
  .addPhoneNumber(123456789, 'WORK')
  .addAddress(null, null, 'street', 'worktown', null, 'workpostcode', 'Belgium')
  .addSocial('https://twitter.com/desloovere_j', 'Twitter', 'desloovere_j')
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
X-SOCIALPROFILE;type=Twitter;x-user=desloovere_j:https://twitter.com/desl
oovere_j
URL:http://www.jeroendesloovere.be
END:VCARD
```

## Forking / Contributing

If you're interested in the development of this project, you can run some ready
to use commands to compile and test your changes.

```sh
# Build
pnpm build

# Test
pnpm test:unit

pnpm test:functional

pnpm test:web-build

pnpm test:web-export
```

<!-- References -->

[codepen]: https://codepen.io/joaocarmo/pen/PozdprL
[jeroendesloovere]: https://github.com/jeroendesloovere/vcard
[mime-types]: https://www.iana.org/assignments/media-types/media-types.xhtml#image
[skypack]: https://skypack.dev
