# vcard-creator

[![npm version](https://badge.fury.io/js/vcard-creator.svg)](https://badge.fury.io/js/vcard-creator)
[![tests](https://github.com/joaocarmo/vcard-creator/actions/workflows/tests.yml/badge.svg)](https://github.com/joaocarmo/vcard-creator/actions/workflows/tests.yml)

Create vCard 3.0 contacts (`.vcf` files) in Node.js and the browser.

- Writes vCard 3.0 as defined in [RFC 2426][rfc2426]: escaping, line folding and CRLF line endings are done for you.
- Checks every input and throws a clear `VCardException` instead of writing a broken file.
- Writes the forms that contacts apps read, such as Apple's `X-SOCIALPROFILE` and property groups.
- Ships TypeScript types. Has no dependencies.

It is based on _jeroendesloovere_'s [vCard][jeroendesloovere] for PHP.

## Installation

```sh
npm install vcard-creator
```

The package is ESM only. It runs on Node.js 18 or later, in bundlers (webpack, esbuild, Vite) and in a browser `<script type="module">`:

```html
<script type="module">
  import VCard from 'https://cdn.jsdelivr.net/npm/vcard-creator@1/+esm'
</script>
```

## Quick start

```js
import VCard from 'vcard-creator'

const card = new VCard()
  .addName({ givenName: 'Jeroen', familyName: 'Desloovere' })
  .addCompany({ name: 'Siesqo' })
  .addJobtitle('Web Developer')
  .addEmail({ address: 'info@jeroendesloovere.be' })
  .addPhoneNumber({ number: '+32 123 41 21 21', type: ['pref', 'work'] })
  .addAddress({ street: 'street', locality: 'worktown', country: 'Belgium' })
  .addUrl({ url: 'https://www.jeroendesloovere.be' })

console.log(card.toString())
```

```txt
BEGIN:VCARD
VERSION:3.0
PRODID:-//vcard-creator//vcard-creator {version}//EN
REV:{timestamp}
N:Desloovere;Jeroen;;;
FN:Jeroen Desloovere
ORG:Siesqo
TITLE:Web Developer
EMAIL:info@jeroendesloovere.be
TEL;TYPE=PREF,WORK:+32 123 41 21 21
ADR;TYPE=INTL,POSTAL,PARCEL,WORK:;;street;worktown;;;Belgium
URL:https://www.jeroendesloovere.be
END:VCARD
```

Each `add*()` method returns the card, so calls chain. `addName()` also writes `FN`, the display name.

## Saving the file

`toString()` returns the text. The library never writes files. Save the text in Node.js:

```js
import { writeFileSync } from 'node:fs'

writeFileSync('contact.vcf', card.toString())
```

Or offer it as a download in the browser:

```js
const blob = new Blob([card.toString()], { type: card.getContentType() })
const url = URL.createObjectURL(blob)

const link = document.createElement('a')
link.href = url
link.download = 'contact.vcf'
link.click()

// Revoke later, so slow downloads (Safari, WebViews) can finish
setTimeout(() => URL.revokeObjectURL(url), 40_000)
```

Use `getContentType()` (`text/vcard`) as the type. With `text/plain`, Safari on iOS saves the file as `.vcf.txt` ([#41][issue-41]).

## API at a glance

Each method adds 1 vCard property. Your editor shows the options and rules of each method. "Once" methods throw a `VCardException` on a second call.

| Method                | Property                     | Calls    |
| --------------------- | ---------------------------- | -------- |
| `addName()`           | `N` (and `FN`)               | once     |
| `addFullName()`       | `FN`                         | once     |
| `addNickname()`       | `NICKNAME`                   | repeated |
| `addBirthday()`       | `BDAY`                       | once     |
| `addCompany()`        | `ORG`                        | once     |
| `addJobtitle()`       | `TITLE`                      | once     |
| `addRole()`           | `ROLE`                       | once     |
| `addEmail()`          | `EMAIL`                      | repeated |
| `addPhoneNumber()`    | `TEL`                        | repeated |
| `addUrl()`            | `URL`                        | repeated |
| `addAddress()`        | `ADR`                        | repeated |
| `addLabel()`          | `LABEL`                      | repeated |
| `addSocial()`         | `X-SOCIALPROFILE` and `IMPP` | repeated |
| `addImpp()`           | `IMPP`                       | repeated |
| `addGeo()`            | `GEO`                        | once     |
| `addTimezone()`       | `TZ`                         | once     |
| `addPhoto()`          | `PHOTO`                      | repeated |
| `addLogo()`           | `LOGO`                       | repeated |
| `addKey()`            | `KEY`                        | repeated |
| `addNote()`           | `NOTE`                       | repeated |
| `addCategories()`     | `CATEGORIES`                 | once     |
| `addUid()`            | `UID`                        | once     |
| `addSortString()`     | `SORT-STRING`                | once     |
| `addRevision()`       | `REV`                        | once     |
| `addCustomProperty()` | any other property           | repeated |

Other methods:

- `toString()` returns the vCard text.
- `VCard.concat(a, b)` and `a.concat(b)` join cards into 1 multi-contact file.
- `getProperties()` returns the stored properties, already escaped.
- `getContentType()` returns `text/vcard`.

TypeScript users can import the option types (`NameOptions`, `PhotoOptions`, …) and the `type` unions (`EmailType`, `PhoneType`, …):

```ts
import { VCard, VCardException } from 'vcard-creator'
import type { EmailOptions, PhoneType } from 'vcard-creator'
```

## Errors

Invalid input throws a `VCardException`, and nothing is added to the card. The message names the property and shows the rejected value:

```js
import { VCard, VCardException } from 'vcard-creator'

try {
  new VCard().addGeo({ latitude: 999, longitude: 0 })
} catch (error) {
  if (error instanceof VCardException) {
    console.error(error.message) // Invalid geo latitude: 999. Must be between -90 and 90.
  }
}
```

## Learn more

- [Reference](docs/REFERENCE.md): escaping, input rules, error messages, custom properties, property groups and multi-contact files.
- [Migration guide](docs/MIGRATION.md): upgrading from v0.x, and the deprecated members that the next major version removes.
- [Contributing](CONTRIBUTING.md): setup, tests and releases. [Architecture](ARCHITECTURE.md): how the source is organised.

## Licence

[MIT](LICENSE)

[issue-41]: https://github.com/joaocarmo/vcard-creator/issues/41
[jeroendesloovere]: https://github.com/jeroendesloovere/vcard
[rfc2426]: https://tools.ietf.org/html/rfc2426
