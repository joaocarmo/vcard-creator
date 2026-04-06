# vcard-creator

[![npm version](https://badge.fury.io/js/vcard-creator.svg)](https://badge.fury.io/js/vcard-creator)
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

```js
import VCard from 'vcard-creator'

// or as named imports
import { VCard, VCardException } from 'vcard-creator'

const myVCard = new VCard()
```

Works with Node.js (>=18), bundlers (webpack, esbuild, Vite), and `<script type="module">`.

## Example

```js
import VCard from 'vcard-creator'

const myVCard = new VCard()

myVCard
  .addName({ givenName: 'Jeroen', familyName: 'Desloovere' })
  .addCompany({ name: 'Siesqo' })
  .addJobtitle('Web Developer')
  .addRole('Data Protection Officer')
  .addEmail({ address: 'info@jeroendesloovere.be' })
  .addPhoneNumber({ number: 1234121212, type: ['pref', 'work'] })
  .addPhoneNumber({ number: 123456789, type: ['work'] })
  .addAddress({
    street: 'street',
    locality: 'worktown',
    postalCode: 'workpostcode',
    country: 'Belgium',
  })
  .addSocial({
    url: 'https://x.com/desloovere_j',
    type: 'X',
    user: 'desloovere_j',
  })
  .addUrl({ url: 'http://www.jeroendesloovere.be' })
  .addGeo(51.0543, 3.7174)
  .addTimezone('Europe/Brussels')

console.log(myVCard.toString())
```

Output

```txt
BEGIN:VCARD
VERSION:3.0
PRODID:-//vcard-creator//vcard-creator {version}//EN
REV:2026-04-06T00:00:00.000Z
N;CHARSET=utf-8:Desloovere;Jeroen;;;
FN;CHARSET=utf-8:Jeroen Desloovere
ORG;CHARSET=utf-8:Siesqo
TITLE;CHARSET=utf-8:Web Developer
ROLE;CHARSET=utf-8:Data Protection Officer
EMAIL:info@jeroendesloovere.be
TEL;TYPE=PREF,WORK:1234121212
TEL;TYPE=WORK:123456789
ADR;TYPE=WORK,POSTAL;CHARSET=utf-8:;;street;worktown;;workpostcode;Belgium
X-SOCIALPROFILE;type=X;x-user=desloovere_j:https://x.com/desloovere_j
IMPP;X-SERVICE-TYPE=X:https://x.com/desloovere_j
URL:http://www.jeroendesloovere.be
GEO:51.0543;3.7174
TZ:Europe/Brussels
END:VCARD
```

## API

All methods return `this` for chaining.

### Personal

| Method                                                                                       | Description                                    |
| -------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| `addName({ givenName?, familyName?, additionalNames?, honorificPrefix?, honorificSuffix? })` | Structured name ([RFC 2426 §3.1.2][rfc2426-n]) |
| `addNickname(nickname)`                                                                      | Nickname(s) — accepts `string` or `string[]`   |
| `addBirthday(date)`                                                                          | Birthday in `YYYY-MM-DD` format                |

### Organization

| Method                              | Description                          |
| ----------------------------------- | ------------------------------------ |
| `addCompany({ name, department? })` | Organization and optional department |
| `addJobtitle(title)`                | Job title                            |
| `addRole(role)`                     | Role or occupation                   |

### Contact

| Method                              | Description                                                                 |
| ----------------------------------- | --------------------------------------------------------------------------- |
| `addEmail({ address, type? })`      | Email address. Type: `['pref', 'work', 'home']`                             |
| `addPhoneNumber({ number, type? })` | Phone number. Type: `['pref', 'work', 'home', 'voice', 'fax', 'cell', ...]` |
| `addUrl({ url, type? })`            | URL. Type: `['work', 'home']`                                               |

The `type` parameter accepts a typed array for IDE autocomplete and type safety:

```js
myVCard.addEmail({ address: 'john@example.com', type: ['pref', 'work'] })
myVCard.addPhoneNumber({ number: '+1-555-0100', type: ['cell'] })
```

### Address

| Method                                                                                                 | Description                                                                                       |
| ------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------- |
| `addAddress({ street?, locality?, region?, postalCode?, country?, postOfficeBox?, extended?, type? })` | Structured address ([RFC 2426 §3.2.1][rfc2426-adr]). Type defaults to `['work', 'postal']`        |
| `addLabel({ label, type? })`                                                                           | Formatted address label ([RFC 2426 §3.2.2][rfc2426-label]). Type defaults to `['work', 'postal']` |

### Social & Messaging

| Method                            | Description                                                                                                                 |
| --------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `addSocial({ url, type, user? })` | Social profile — emits both `X-SOCIALPROFILE` (iOS/macOS) and `IMPP` ([RFC 4770][rfc4770]) for cross-platform compatibility |
| `addImpp({ uri, serviceType? })`  | Instant messaging ([RFC 4770][rfc4770]) — for protocols like XMPP, SIP                                                      |

```js
// Social profiles (dual output for iOS + Android)
myVCard.addSocial({
  url: 'https://x.com/desloovere_j',
  type: 'X',
  user: 'desloovere_j',
})
myVCard.addSocial({ url: 'https://linkedin.com/in/jdoe', type: 'LinkedIn' })

// Standalone IM protocols
myVCard.addImpp({ uri: 'xmpp:user@example.com', serviceType: 'XMPP' })
myVCard.addImpp({ uri: 'sip:user@example.com', serviceType: 'SIP' })
```

### Geographic

| Method                        | Description                                                                             |
| ----------------------------- | --------------------------------------------------------------------------------------- |
| `addGeo(latitude, longitude)` | Geographic coordinates ([RFC 2426 §3.4.2][rfc2426-geo]). Validates ranges.              |
| `addTimezone(timezone)`       | UTC offset (`-05:00`) or IANA name (`America/New_York`) ([RFC 2426 §3.4.1][rfc2426-tz]) |

### Media

| Method                       | Description                                      |
| ---------------------------- | ------------------------------------------------ |
| `addPhotoUrl({ url })`       | Photo by URL ([RFC 2426 §3.1.4][rfc2426-photo])  |
| `addPhoto({ image, mime? })` | Photo as base64 content. MIME defaults to `JPEG` |
| `addLogoUrl({ url })`        | Logo by URL ([RFC 2426 §3.5.3][rfc2426-logo])    |
| `addLogo({ image, mime? })`  | Logo as base64 content. MIME defaults to `JPEG`  |

Images must be provided already base64-encoded. Include the proper [MIME type][mime-types].

```js
import { readFileSync } from 'fs'
import VCard from 'vcard-creator'

const image = readFileSync('./path/to/sample.jpg', { encoding: 'base64' })

const vCard = new VCard()
vCard.addPhoto({ image, mime: 'JPEG' })
```

### Other

| Method                      | Description                                                                         |
| --------------------------- | ----------------------------------------------------------------------------------- |
| `addUid(uid)`               | Unique identifier                                                                   |
| `addCategories(categories)` | Categories/tags — accepts `string[]`                                                |
| `addNote(note)`             | Free-text note                                                                      |
| `addSortString(sortString)` | Sort key for name ordering ([RFC 2426 §3.6.5][rfc2426-sort]) — useful for CJK names |

### Custom Properties

For any property not covered by the built-in methods, use `addCustomProperty()`:

```js
myVCard.addCustomProperty({ name: 'X-PHONETIC-FIRST-NAME', value: 'Jon' })
myVCard.addCustomProperty({ name: 'X-PHONETIC-LAST-NAME', value: 'Sumisu' })
myVCard.addCustomProperty({ name: 'X-ANNIVERSARY', value: '2010-06-15' })
myVCard.addCustomProperty({
  name: 'X-CUSTOM',
  value: 'value',
  params: 'TYPE=work',
})
```

The property name is uppercased automatically.

### Error Handling

`VCardException` is thrown for invalid operations (duplicate single-value properties, invalid MIME types, out-of-range coordinates). It's exported for catch blocks:

```js
import { VCard, VCardException } from 'vcard-creator'

try {
  const vCard = new VCard()
  vCard.addGeo(999, 0) // out of range
} catch (error) {
  if (error instanceof VCardException) {
    console.error('vCard error:', error.message)
  }
}
```

## Migration from v0.x

For the previous API documentation, see the [v0.11.0 README][readme-v0.11].

Key changes in v1.0:

- **ESM only** — `require('vcard-creator')` is no longer supported
- **Object params only** — positional arguments have been removed
- **Method aliases removed** — use `addUrl()`, `addUid()`, `addLogoUrl()`, `addPhotoUrl()`
- **vCalendar format removed** — use `new VCard()` (no format parameter)

## Forking / Contributing

If you're interested in the development of this project, you can run some ready
to use commands to compile and test your changes.

```sh
# Build
pnpm build

# Test
pnpm test:unit

pnpm test:functional
```

<!-- References -->

[jeroendesloovere]: https://github.com/jeroendesloovere/vcard
[mime-types]: https://www.iana.org/assignments/media-types/media-types.xhtml#image
[rfc2426-adr]: https://tools.ietf.org/html/rfc2426#section-3.2.1
[rfc2426-geo]: https://tools.ietf.org/html/rfc2426#section-3.4.2
[rfc2426-label]: https://tools.ietf.org/html/rfc2426#section-3.2.2
[rfc2426-logo]: https://tools.ietf.org/html/rfc2426#section-3.5.3
[rfc2426-n]: https://tools.ietf.org/html/rfc2426#section-3.1.2
[rfc2426-photo]: https://tools.ietf.org/html/rfc2426#section-3.1.4
[rfc2426-sort]: https://tools.ietf.org/html/rfc2426#section-3.6.5
[rfc2426-tz]: https://tools.ietf.org/html/rfc2426#section-3.4.1
[readme-v0.11]: https://github.com/joaocarmo/vcard-creator/blob/v0.11.0/README.md
[rfc4770]: https://tools.ietf.org/html/rfc4770
