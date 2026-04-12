# vcard-creator

[![npm version](https://badge.fury.io/js/vcard-creator.svg)](https://badge.fury.io/js/vcard-creator)
![tests](https://github.com/joaocarmo/vcard-creator/workflows/Tests/badge.svg)

A JavaScript vCard creator library for both node.js and the web. Supports **vCard 3.0** ([RFC 2426][rfc2426]) by default and **vCard 4.0** ([RFC 6350][rfc6350]) as an opt-in.
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

// types are also exported
import type { EmailOptions, PhoneType, PhotoOptions } from 'vcard-creator'

// vCard 3.0 (RFC 2426) — default, zero breaking changes
const myVCard = new VCard()

// vCard 4.0 (RFC 6350) — opt-in via factory
const myVCardV4 = VCard.v4()

// vCard 4.0 — opt-in via constructor option
const myVCardV4Alt = new VCard({ version: 4 })
```

Works with Node.js (>=18), bundlers (webpack, esbuild, Vite), and `<script type="module">`.

> **vCard 4.0 is opt-in.** Calling `new VCard()` always produces vCard 3.0 output — no existing
> behaviour changes. Use `VCard.v4()` or `new VCard({ version: 4 })` to enable RFC 6350 features.

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
  .addGeo({ latitude: 51.0543, longitude: 3.7174 })
  .addTimezone('Europe/Brussels')

console.log(myVCard.toString())
```

Output

```txt
BEGIN:VCARD
VERSION:3.0
PRODID:-//vcard-creator//vcard-creator {version}//EN
REV:2026-04-06T00:00:00.000Z
N:Desloovere;Jeroen;;;
FN:Jeroen Desloovere
ORG:Siesqo
TITLE:Web Developer
ROLE:Data Protection Officer
EMAIL:info@jeroendesloovere.be
TEL;TYPE=PREF,WORK:1234121212
TEL;TYPE=WORK:123456789
ADR;TYPE=INTL,POSTAL,PARCEL,WORK:;;street;worktown;;workpostcode;Belgium
X-SOCIALPROFILE;type=X;x-user=desloovere_j:https://x.com/desloovere_j
IMPP;X-SERVICE-TYPE=X:https://x.com/desloovere_j
URL:http://www.jeroendesloovere.be
GEO:51.0543;3.7174
TZ:Europe/Brussels
END:VCARD
```

### vCard 4.0 example

```js
import VCard from 'vcard-creator'

const myVCard = VCard.v4()

myVCard
  .addName({ givenName: 'Ada', familyName: 'Lovelace' })
  .addGender({ sex: 'F' })
  .addKind('individual')
  .addCompany({ name: 'Analytical Engine Ltd', sortAs: 'Analytical' })
  .addJobtitle('Mathematician')
  .addEmail({ address: 'ada@example.com', pref: 1 })
  .addPhoneNumber({
    number: 'tel:+1-555-0100',
    type: ['work', 'cell'],
    pref: 1,
  })
  .addAddress({
    street: '1 Mill Road',
    locality: 'Cambridge',
    country: 'UK',
    label: '1 Mill Road\nCambridge\nUK',
  })
  .addUrl({ url: 'https://en.wikipedia.org/wiki/Ada_Lovelace' })
  .addGeo({ latitude: 52.2053, longitude: 0.1218 })
  .addAnniversary({ date: new Date('1815-12-10') })
  .addLang({ language: 'en', pref: 1 })

console.log(myVCard.toString())
```

Output

```txt
BEGIN:VCARD
VERSION:4.0
PRODID:-//vcard-creator//vcard-creator {version}//EN
REV:2026-04-06T00:00:00.000Z
N:Lovelace;Ada;;;
FN:Ada Lovelace
GENDER:F
KIND:individual
ORG;SORT-AS="Analytical":Analytical Engine Ltd
TITLE:Mathematician
EMAIL;PREF=1:ada@example.com
TEL;VALUE=uri;TYPE=WORK,CELL;PREF=1:tel:+1-555-0100
ADR;TYPE=WORK;LABEL="1 Mill Road\nCambridge\nUK":;;1 Mill Road;Cambridge;;; UK
URL:https://en.wikipedia.org/wiki/Ada_Lovelace
GEO:geo:52.2053,0.1218
ANNIVERSARY:1815-12-10
LANG;PREF=1:en
END:VCARD
```

## vCard 3.0 vs vCard 4.0

vCard 4.0 ([RFC 6350][rfc6350]) modernises the format and is a superset of vCard 3.0 ([RFC 2426][rfc2426]). The table below summarises the key differences and how this library handles them.

| Feature / Property       | vCard 3.0 (RFC 2426)                                                | vCard 4.0 (RFC 6350)                                                                 |
| ------------------------ | ------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| **Version line**         | `VERSION:3.0`                                                       | `VERSION:4.0`                                                                        |
| **Charset**              | `CHARSET=utf-8` emitted on text properties                          | UTF-8 mandated; `CHARSET` param suppressed                                           |
| **GEO format**           | `GEO:<lat>;<lon>` (semicolon-separated)                             | `GEO:geo:<lat>,<lon>` (RFC 5870 geo URI)                                             |
| **PREF encoding**        | `TYPE=PREF` on individual properties                                | `PREF=1`–`100` numeric param (1 = most preferred)                                    |
| **LABEL property**       | Standalone `LABEL` property                                         | Removed; use `LABEL="…"` parameter on `ADR`                                          |
| **SORT-STRING property** | Standalone `SORT-STRING` property ([RFC 2426 §3.6.5][rfc2426-sort]) | Replaced by `SORT-AS="…"` param on `N` or `ORG`                                      |
| **TEL value type**       | Plain number string                                                 | `VALUE=uri` — e.g., `tel:+1-555-0100`                                                |
| **Multiple FN**          | At most one `FN` property                                           | One or more `FN` permitted (cardinality `1*`)                                        |
| **Property grouping**    | Supported (opt-in via `useGroups`)                                  | Supported, standardised in [RFC 6350 §3.3][rfc6350-groups]                           |
| **KIND** (new)           | ✗ Not available                                                     | `KIND:individual`, `group`, `org`, `location` ([RFC 6350 §6.1.4][rfc6350-kind])      |
| **GENDER** (new)         | ✗ Not available                                                     | `GENDER:M/F/O/N/U` with optional identity text ([RFC 6350 §6.2.7][rfc6350-gender])   |
| **ANNIVERSARY** (new)    | ✗ Not available                                                     | `ANNIVERSARY:YYYY-MM-DD` with optional `CALSCALE` ([RFC 6350 §6.2.6][rfc6350-anniv]) |
| **LANG** (new)           | ✗ Not available                                                     | `LANG:<BCP47-tag>` with `PREF` and `TYPE` ([RFC 6350 §6.4.4][rfc6350-lang])          |
| **RELATED** (new)        | ✗ Not available                                                     | Links to related persons/entities ([RFC 6350 §6.6.6][rfc6350-related])               |
| **MEMBER** (new)         | ✗ Not available                                                     | URI membership for `KIND:group` cards ([RFC 6350 §6.6.5][rfc6350-member])            |
| **SOURCE** (new)         | ✗ Not available                                                     | Directory source URI ([RFC 6350 §6.1.3][rfc6350-source])                             |
| **XML** (new)            | ✗ Not available                                                     | Embedded XML content ([RFC 6350 §6.1.5][rfc6350-xml])                                |
| **CLIENTPIDMAP** (new)   | ✗ Not available                                                     | PID-to-URI mapping for synchronisation ([RFC 6350 §6.7.7][rfc6350-cpidmap])          |
| **FBURL** (new)          | ✗ Not available                                                     | Free/busy URL ([RFC 6350 §6.9.1][rfc6350-fburl])                                     |
| **CALADRURI** (new)      | ✗ Not available                                                     | Calendar address URI ([RFC 6350 §6.9.2][rfc6350-caladruri])                          |
| **CALURI** (new)         | ✗ Not available                                                     | Calendar URI ([RFC 6350 §6.9.3][rfc6350-caluri])                                     |
| **ALTID / PID params**   | ✗ Not available                                                     | Cross-property grouping and instance identification ([RFC 6350 §5.4][rfc6350-altid]) |
| **CALSCALE param**       | ✗ Not available                                                     | Optional calendar scale on `BDAY` and `ANNIVERSARY`                                  |
| **MEDIATYPE param**      | ✗ Not available                                                     | Media type hint on URI-valued properties (`PHOTO`, `LOGO`, `KEY`, `URL`)             |

### Opting in to vCard 4.0

vCard 4.0 is **opt-in**. `new VCard()` always produces vCard 3.0 — no existing consumers are affected.

```js
// vCard 3.0 — default, no changes required
const v3 = new VCard()

// vCard 4.0 — ergonomic factory method
const v4 = VCard.v4()

// vCard 4.0 — explicit constructor option
const v4alt = new VCard({ version: 4 })
```

v4-only methods (`addKind`, `addGender`, `addAnniversary`, `addLang`, `addRelated`, `addMember`,
`addSource`, `addXml`, `addClientPidMap`, `addFbUrl`, `addCalAdrUri`, `addCalUri`) throw a
`VCardException` when called on a v3 instance, with a message directing you to use `VCard.v4()`.

## API

All `add*` methods return `this` for chaining.

### Personal

| Method                                                                                                | Description                                                                                      |
| ----------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| `addFullName(fullName)`                                                                               | Formatted name — overrides auto-generated FN ([RFC 2426 §3.1.1][rfc2426-fn])                     |
| `addName({ givenName?, familyName?, additionalNames?, honorificPrefix?, honorificSuffix?, sortAs? })` | Structured name. `sortAs` applies `SORT-AS` param on `N` in v4 ([RFC 6350 §5.9][rfc6350-sortas]) |
| `addNickname(nickname)`                                                                               | Nickname(s) — accepts `string` or `string[]`                                                     |
| `addBirthday(date, calscale?)`                                                                        | Birthday — accepts `Date` or `'YYYY-MM-DD'`; optional `CALSCALE` param in v4                     |

`addName()` auto-generates FN from the name components. Use `addFullName()` to set it directly — useful for mononyms, company-as-contact, or custom formatting.

### Organization

| Method                                       | Description                                                                  |
| -------------------------------------------- | ---------------------------------------------------------------------------- |
| `addCompany({ name, department?, sortAs? })` | Organization and optional department. `sortAs` applies `SORT-AS` param in v4 |
| `addJobtitle(title)`                         | Job title                                                                    |
| `addRole(role)`                              | Role or occupation                                                           |

### Contact

| Method                                                           | Description                                                                                  |
| ---------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| `addEmail({ address, type?, pref?, altid?, pid? })`              | Email address. Type: `['internet', 'pref', 'work', 'home']`. v4: `pref`/`altid`/`pid` params |
| `addPhoneNumber({ number, type?, value?, pref?, altid?, pid? })` | Phone number. v4: `VALUE=uri` and `pref`/`altid`/`pid` params                                |
| `addUrl({ url, type?, pref?, altid?, pid?, mediaType? })`        | URL. v4: `pref`/`altid`/`pid`/`mediaType` params                                             |

The `type` parameter accepts a typed array for IDE autocomplete and type safety:

```js
myVCard.addEmail({ address: 'john@example.com', type: ['pref', 'work'] })
myVCard.addPhoneNumber({ number: '+1-555-0100', type: ['cell'] })
```

### Address

| Method                                                                                                                    | Description                                                                                                                                                                        |
| ------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `addAddress({ street?, locality?, region?, postalCode?, country?, postOfficeBox?, extended?, type?, label?, geo?, tz? })` | Structured address ([RFC 2426 §3.2.1][rfc2426-adr]). v4: inline `LABEL`, `GEO`, `TZ` params replace standalone properties. Type defaults to `['intl', 'postal', 'parcel', 'work']` |
| `addLabel({ label, type? })`                                                                                              | Formatted address label ([RFC 2426 §3.2.2][rfc2426-label]). **No-op in v4** — use `addAddress({ label: '…' })` instead.                                                            |

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

| Method                            | Description                                                                                                            |
| --------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `addGeo({ latitude, longitude })` | Geographic coordinates. v3: `GEO:<lat>;<lon>` ([RFC 2426 §3.4.2][rfc2426-geo]); v4: `GEO:geo:<lat>,<lon>` RFC 5870 URI |
| `addTimezone(timezone)`           | UTC offset (`-05:00`) or IANA name (`America/New_York`) ([RFC 2426 §3.4.1][rfc2426-tz])                                |

### Media

| Method                       | Description                                      |
| ---------------------------- | ------------------------------------------------ |
| `addPhoto({ url })`          | Photo by URL ([RFC 2426 §3.1.4][rfc2426-photo])  |
| `addPhoto({ image, mime? })` | Photo as base64 content. MIME defaults to `JPEG` |
| `addLogo({ url })`           | Logo by URL ([RFC 2426 §3.5.3][rfc2426-logo])    |
| `addLogo({ image, mime? })`  | Logo as base64 content. MIME defaults to `JPEG`  |

Each method accepts either a `{ url }` or `{ image, mime? }` object. Multiple photos/logos are allowed (e.g., a base64 thumbnail and a URL fallback). See [IANA image MIME types][mime-types] for valid values.

```js
import { readFileSync } from 'fs'
import VCard from 'vcard-creator'

const image = readFileSync('./path/to/sample.jpg', { encoding: 'base64' })

const vCard = new VCard()
vCard.addPhoto({ image, mime: 'JPEG' })
vCard.addPhoto({ url: 'https://example.com/photo.jpg' })
```

### Security

| Method                   | Description                                        |
| ------------------------ | -------------------------------------------------- |
| `addKey({ url })`        | Public key by URL ([RFC 2426 §3.7.1][rfc2426-key]) |
| `addKey({ key, mime? })` | Public key as base64. MIME defaults to `PGP`       |

```js
// PGP key by URL
vCard.addKey({ url: 'https://example.com/key.pub' })

// Embedded X.509 certificate
vCard.addKey({ key: base64cert, mime: 'X509' })
```

### Other

| Method                      | Description                                                                                                  |
| --------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `addUid(uid)`               | Unique identifier                                                                                            |
| `addCategories(categories)` | Categories/tags — accepts `string[]`                                                                         |
| `addNote(note)`             | Free-text note                                                                                               |
| `addSortString(sortString)` | Sort key for name ordering — v3: `SORT-STRING` ([RFC 2426 §3.6.5][rfc2426-sort]); v4: `SORT-AS` param on `N` |
| `addRevision(date)`         | Revision timestamp — accepts `Date`. Overrides auto-generated `REV`                                          |

### vCard 4.0 — Identity & Classification

_These methods throw `VCardException` on a v3 instance. Use `VCard.v4()` to enable them._

| Method                                | Description                                                                                         |
| ------------------------------------- | --------------------------------------------------------------------------------------------------- |
| `addKind(kind)`                       | Contact kind: `'individual'`, `'group'`, `'org'`, `'location'` ([RFC 6350 §6.1.4][rfc6350-kind])    |
| `addGender({ sex?, identity? })`      | Sex code (`M`, `F`, `O`, `N`, `U`) and optional gender identity ([RFC 6350 §6.2.7][rfc6350-gender]) |
| `addAnniversary({ date, calscale? })` | Anniversary date — accepts `Date` or string; optional `CALSCALE` ([RFC 6350 §6.2.6][rfc6350-anniv]) |
| `addLang({ language, pref?, type? })` | Preferred language with BCP 47 tag and optional `PREF`/`TYPE` ([RFC 6350 §6.4.4][rfc6350-lang])     |
| `addSource(url)`                      | Directory source URI — allows multiple ([RFC 6350 §6.1.3][rfc6350-source])                          |
| `addXml(xml)`                         | Embedded XML content — allows multiple ([RFC 6350 §6.1.5][rfc6350-xml])                             |

```js
VCard.v4()
  .addKind('individual')
  .addGender({ sex: 'F', identity: 'she/her' })
  .addAnniversary({ date: '2010-06-15', calscale: 'gregorian' })
  .addLang({ language: 'en', pref: 1 })
  .addLang({ language: 'fr', pref: 2 })
  .addSource('ldap://directory.example.com/cn=Ada')
```

### vCard 4.0 — Relationships

_These methods throw `VCardException` on a v3 instance. Use `VCard.v4()` to enable them._

| Method                         | Description                                                                                                                                |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `addRelated({ value, type? })` | Relationship to another person or entity. URI values gain `VALUE=uri`; non-URI values are plain text. ([RFC 6350 §6.6.6][rfc6350-related]) |
| `addMember(uri)`               | URI member of a `KIND:group` card — allows multiple ([RFC 6350 §6.6.5][rfc6350-member])                                                    |

```js
// Relationships
const group = VCard.v4()
  .addKind('group')
  .addFullName('Engineering Team')
  .addMember('mailto:alice@example.com')
  .addMember('mailto:bob@example.com')

const person = VCard.v4()
  .addRelated({ value: 'mailto:manager@example.com', type: ['colleague'] })
  .addRelated({ value: 'Jane Smith' })
```

### vCard 4.0 — Synchronisation

_These methods throw `VCardException` on a v3 instance. Use `VCard.v4()` to enable them._

| Method                      | Description                                                                                   |
| --------------------------- | --------------------------------------------------------------------------------------------- |
| `addClientPidMap(pid, uri)` | Maps a source `pid` integer to a URI for synchronisation ([RFC 6350 §6.7.7][rfc6350-cpidmap]) |

```js
VCard.v4()
  .addClientPidMap(1, 'urn:uuid:3df403f4-5924-4bb7-b077-3c711d9f579f')
  .addClientPidMap(2, 'urn:uuid:d89c9c7a-2e1b-4832-82de-7e4d0a071234')
```

### vCard 4.0 — Calendar Integration

_These methods throw `VCardException` on a v3 instance. Use `VCard.v4()` to enable them._

| Method              | Description                                                        |
| ------------------- | ------------------------------------------------------------------ |
| `addFbUrl(url)`     | Free/busy URL — allows multiple ([RFC 6350 §6.9.1][rfc6350-fburl]) |
| `addCalAdrUri(uri)` | Calendar request address ([RFC 6350 §6.9.2][rfc6350-caladruri])    |
| `addCalUri(url)`    | Calendar URI ([RFC 6350 §6.9.3][rfc6350-caluri])                   |

```js
VCard.v4()
  .addFbUrl('https://example.com/busy/ada')
  .addCalAdrUri('mailto:ada@example.com')
  .addCalUri('https://example.com/cal/ada')
```

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

The property name is uppercased automatically. Values are **not** automatically escaped — you are responsible for escaping special characters (`;`, `,`, `\`, newlines) in custom property values.

### Property Grouping

Apple Contacts uses property grouping for custom labels. Use the `group` option on `addCustomProperty()`:

```js
myVCard
  .addCustomProperty({
    name: 'TEL',
    value: '+1-555-1234',
    group: 'item1',
  })
  .addCustomProperty({
    name: 'X-ABLabel',
    value: 'Work Phone',
    group: 'item1',
  })
```

This produces:

```txt
item1.TEL:+1-555-1234
item1.X-ABLABEL:Work Phone
```

### Text Escaping

Built-in methods automatically escape special characters per [RFC 2426][rfc2426]:

- Backslash (`\`) → `\\`
- Semicolon (`;`) → `\;`
- Comma (`,`) → `\,`
- Newlines → `\n`

This applies to text values in `addFullName`, `addName`, `addAddress`, `addCompany`, `addNickname`, `addCategories`, `addJobtitle`, `addRole`, `addNote`, `addLabel`, and `addSortString`. Non-text values (URLs, emails, phone numbers, etc.) are passed through as-is.

### Error Handling

`VCardException` is thrown for invalid operations (duplicate single-value properties, invalid MIME types, out-of-range coordinates). It's exported for catch blocks:

```js
import { VCard, VCardException } from 'vcard-creator'

try {
  const vCard = new VCard()
  vCard.addGeo({ latitude: 999, longitude: 0 }) // out of range
} catch (error) {
  if (error instanceof VCardException) {
    console.error('vCard error:', error.message)
  }
}
```

### Multi-Contact Files

Combine multiple vCards into a single `.vcf` file for address book exports. Follows the `Array.prototype.concat` pattern:

```js
import VCard from 'vcard-creator'

const card1 = new VCard()
  .addName({ givenName: 'Alice', familyName: 'Smith' })
  .addEmail({ address: 'alice@example.com' })

const card2 = new VCard()
  .addName({ givenName: 'Bob', familyName: 'Jones' })
  .addEmail({ address: 'bob@example.com' })

// Instance — "this" card appears first
const output = card1.concat(card2)

// Static — pure combination
const combined = VCard.concat(card1, card2)
```

Each card retains its own `BEGIN:VCARD` / `END:VCARD` markers.

## Migration from v0.x

For the previous API documentation, see the [v0.11.0 README][readme-v0.11].

Key changes in v1.0:

- **ESM only** — `require('vcard-creator')` is no longer supported
- **Object params only** — positional arguments have been removed
- **Merged media methods** — `addPhotoUrl()`/`addLogoUrl()` merged into `addPhoto({ url })`/`addLogo({ url })`
- **`addGeo(lat, lon)`** → `addGeo({ latitude, longitude })`
- **`addFullName()`** — new method to set FN directly
- **`addKey()`** — new method for public encryption keys (PGP, X.509)
- **Multiple instances** — `photo`, `logo`, `note`, `nickname`, and `key` now allow multiple additions
- **Content-Type** — `getContentType()` returns `text/vcard` (was `text/x-vcard`)
- **`EmailType`** — added `'internet'` per RFC 2426
- **vCalendar format removed** — use `new VCard()` (no format parameter)
- **CHARSET removed** — `CHARSET=utf-8` is no longer added to properties (vCard 3.0 assumes UTF-8)
- **Text escaping** — special characters are now properly escaped per RFC 2426
- **`addBirthday`** — accepts `Date` or `'YYYY-MM-DD'` string (was `string` only)
- **`getProperties()`** — returns pre-escaped wire-format values
- **`concat()`** — new method for multi-contact `.vcf` files (static and instance)

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
[rfc2426]: https://tools.ietf.org/html/rfc2426
[rfc2426-adr]: https://tools.ietf.org/html/rfc2426#section-3.2.1
[rfc2426-fn]: https://tools.ietf.org/html/rfc2426#section-3.1.1
[rfc2426-geo]: https://tools.ietf.org/html/rfc2426#section-3.4.2
[rfc2426-key]: https://tools.ietf.org/html/rfc2426#section-3.7.1
[rfc2426-label]: https://tools.ietf.org/html/rfc2426#section-3.2.2
[rfc2426-logo]: https://tools.ietf.org/html/rfc2426#section-3.5.3
[rfc2426-n]: https://tools.ietf.org/html/rfc2426#section-3.1.2
[rfc2426-photo]: https://tools.ietf.org/html/rfc2426#section-3.1.4
[rfc2426-sort]: https://tools.ietf.org/html/rfc2426#section-3.6.5
[rfc2426-tz]: https://tools.ietf.org/html/rfc2426#section-3.4.1
[readme-v0.11]: https://github.com/joaocarmo/vcard-creator/blob/v0.11.0/README.md
[rfc4770]: https://tools.ietf.org/html/rfc4770
[rfc6350]: https://tools.ietf.org/html/rfc6350
[rfc6350-altid]: https://tools.ietf.org/html/rfc6350#section-5.4
[rfc6350-anniv]: https://tools.ietf.org/html/rfc6350#section-6.2.6
[rfc6350-caladruri]: https://tools.ietf.org/html/rfc6350#section-6.9.2
[rfc6350-caluri]: https://tools.ietf.org/html/rfc6350#section-6.9.3
[rfc6350-cpidmap]: https://tools.ietf.org/html/rfc6350#section-6.7.7
[rfc6350-fburl]: https://tools.ietf.org/html/rfc6350#section-6.9.1
[rfc6350-gender]: https://tools.ietf.org/html/rfc6350#section-6.2.7
[rfc6350-groups]: https://tools.ietf.org/html/rfc6350#section-3.3
[rfc6350-kind]: https://tools.ietf.org/html/rfc6350#section-6.1.4
[rfc6350-lang]: https://tools.ietf.org/html/rfc6350#section-6.4.4
[rfc6350-member]: https://tools.ietf.org/html/rfc6350#section-6.6.5
[rfc6350-related]: https://tools.ietf.org/html/rfc6350#section-6.6.6
[rfc6350-sortas]: https://tools.ietf.org/html/rfc6350#section-5.9
[rfc6350-source]: https://tools.ietf.org/html/rfc6350#section-6.1.3
[rfc6350-xml]: https://tools.ietf.org/html/rfc6350#section-6.1.5
