# vcard-creator

[![npm version](https://badge.fury.io/js/vcard-creator.svg)](https://badge.fury.io/js/vcard-creator)
[![tests](https://github.com/joaocarmo/vcard-creator/actions/workflows/tests.yml/badge.svg)](https://github.com/joaocarmo/vcard-creator/actions/workflows/tests.yml)

A JavaScript library that creates vCard 3.0 contacts, for Node.js and the browser.
It returns the vCard text, which you save as a `.vcf` file.

## Origin

This is based on _jeroendesloovere_'s [vCard][jeroendesloovere] for PHP.

## Installation

```sh
pnpm add vcard-creator

# or

npm install vcard-creator
```

## Usage

Use the default import:

```ts
import VCard from 'vcard-creator'

const myVCard = new VCard()
```

Or use named imports. Types are also exported:

```ts
import { VCard, VCardException } from 'vcard-creator'
import type { EmailOptions, PhoneType, PhotoOptions } from 'vcard-creator'
```

It works with Node.js 18 or later, bundlers (webpack, esbuild, Vite) and `<script type="module">`:

```html
<script type="module">
  import VCard from 'https://cdn.jsdelivr.net/npm/vcard-creator@1/+esm'

  const myVCard = new VCard().addName({ givenName: 'Jane', familyName: 'Doe' })
  console.log(myVCard.toString())
</script>
```

### TypeScript

The `type` unions (`AddressType`, `EmailType`, `PhoneType`, `UrlType`) give autocomplete for `type` arrays.
Methods that take an object have an exported options type, such as `NameOptions`, `AddressOptions` or `PhotoOptions`.

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
  .addPhoneNumber({ number: '+32 123 41 21 21', type: ['pref', 'work'] })
  .addPhoneNumber({ number: '+32 123 45 67 89', type: ['work'] })
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
  .addUrl({ url: 'https://www.jeroendesloovere.be' })
  .addGeo({ latitude: 51.0543, longitude: 3.7174 })
  .addTimezone('+01:00')

console.log(myVCard.toString())
```

Output

```txt
BEGIN:VCARD
VERSION:3.0
PRODID:-//vcard-creator//vcard-creator {version}//EN
REV:{timestamp}
N:Desloovere;Jeroen;;;
FN:Jeroen Desloovere
ORG:Siesqo
TITLE:Web Developer
ROLE:Data Protection Officer
EMAIL:info@jeroendesloovere.be
TEL;TYPE=PREF,WORK:+32 123 41 21 21
TEL;TYPE=WORK:+32 123 45 67 89
ADR;TYPE=INTL,POSTAL,PARCEL,WORK:;;street;worktown;;workpostcode;Belgium
X-SOCIALPROFILE;type=X;x-user=desloovere_j:https://x.com/desloovere_j
IMPP;X-SERVICE-TYPE=X:https://x.com/desloovere_j
URL:https://www.jeroendesloovere.be
GEO:51.0543;3.7174
TZ:+01:00
END:VCARD
```

## Saving the File

`toString()` returns the vCard text. Save it as a `.vcf` file.

In the browser:

```js
const blob = new Blob([myVCard.toString()], {
  type: myVCard.getContentType(),
})
const url = URL.createObjectURL(blob)

const link = document.createElement('a')
link.href = url
link.download = 'contact.vcf'
document.body.append(link)
link.click()
link.remove()

// revoke later, so slow downloads (Safari, WebViews) can finish first
setTimeout(() => URL.revokeObjectURL(url), 40_000)
```

Use `getContentType()` (`text/vcard`) as the type. With `text/plain`, Safari on iOS saves the file as `.vcf.txt` ([#41][issue-41]).

In Node.js:

```js
import { writeFileSync } from 'node:fs'

writeFileSync('contact.vcf', myVCard.toString())
```

## Output Format

- Lines end with CRLF (`\r\n`), as the RFC requires.
- Lines longer than 75 octets are folded. Folding never splits a UTF-8 character.
- `VERSION`, `PRODID` and `REV` are added automatically. `REV` is the time `toString()` runs, unless you set it with `addRevision()`. It is written in UTC without a fraction of a second, such as `REV:2024-01-15T10:30:00Z`.

## API

All `add*` methods return `this`, so you can chain them.

### Personal

| Method                                                                                       | Description                                                                                                                                          |
| -------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `addFullName(fullName)`                                                                      | Formatted name ([RFC 2426 §3.1.1][rfc2426-fn]). Call it before `addName()`                                                                           |
| `addName({ givenName?, familyName?, additionalNames?, honorificPrefix?, honorificSuffix? })` | Structured name ([RFC 2426 §3.1.2][rfc2426-n]). Adds `FN` only when no `FN` exists                                                                   |
| `addNickname(nickname)`                                                                      | Nickname or nicknames. Accepts `string` or `string[]`                                                                                                |
| `addBirthday(date)`                                                                          | Birthday. Accepts an RFC 2425 date or date-time string, or a `Date` (read in UTC, see the note below). A date-time is written with `VALUE=date-time` |

`addName()` creates FN from the name parts. To set FN yourself, call `addFullName()` **before** `addName()`. `addName()` then keeps your FN. An FN from `addCustomProperty()` also stops `addName()` from adding one.
If `addName()` already created an FN, calling `addFullName()` after it throws a `VCardException`.
Use `addFullName()` for single names, a company as the contact, or a custom format.

`addBirthday()` writes a string as it is. Use a string for an exact date.
A string must be a date or date-time in the RFC 2425 format ([§5.8.4][rfc2425-datetime]), such as `1990-05-15`, `19900515` or `1953-10-15T23:10:00Z`. The date must exist, so `1990-02-30` throws.
A date-time string, such as `1953-10-15T23:10:00Z`, is written as `BDAY;VALUE=date-time:1953-10-15T23:10:00Z`. The default `BDAY` value type is `date`, so `VALUE` names the other type. `T` and `Z` can also be lower case, as in the RFC grammar.
A `Date` must have a year from `0000` to `9999`. Other values throw a `VCardException`.
A `Date` is read in UTC:

- `new Date('1990-05-15')` and the `valueAsDate` of a date input are UTC midnight, so they give the right day.
- `new Date(1990, 4, 15)` is local midnight. East of UTC, it becomes the day before.

A card holds 1 birthday. Use one of these calls:

```js
myVCard.addBirthday('1990-05-15')
// BDAY:1990-05-15

myVCard.addBirthday('1953-10-15T23:10:00Z')
// BDAY;VALUE=date-time:1953-10-15T23:10:00Z
```

### Organisation

| Method                              | Description                          |
| ----------------------------------- | ------------------------------------ |
| `addCompany({ name, department? })` | Organisation and optional department |
| `addJobtitle(title)`                | Job title                            |
| `addRole(role)`                     | Role or occupation                   |

### Contact

| Method                              | Description                                                                                                                                |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `addEmail({ address, type? })`      | Email address. Type: `['internet', 'pref', 'work', 'home']`. The address is escaped as RFC 2426 text (see [Text Escaping](#text-escaping)) |
| `addPhoneNumber({ number, type? })` | Phone number. Type: `['pref', 'work', 'home', 'voice', 'fax', 'cell', ...]`. Pass `number` as a string. A `number` is **deprecated**       |
| `addUrl({ url, type? })`            | URL. Type: `['work', 'home']`                                                                                                              |

The `type` parameter takes a typed array, for IDE autocomplete and type safety:

```js
myVCard.addEmail({ address: 'john@example.com', type: ['pref', 'work'] })
myVCard.addPhoneNumber({ number: '+1-555-0100', type: ['cell'] })
```

Pass phone numbers as strings. A number loses a leading `0` and the `+` sign ([#43][issue-43]). `1e21` is written as `1e+21`, and integers above `Number.MAX_SAFE_INTEGER` change their last digits. A `number` is deprecated and is removed in the next major version ([#156][issue-156]).

A `url` must not contain control characters, such as a line break. Such a value throws a `VCardException`. Percent-encode them (`%0A`).

A `url` must be a string. Pass a `URL` object as `url.href`.

A `number` with a control character also throws a `VCardException`. So does a `number` that is `NaN`, `Infinity` or `-Infinity`.

A `type` entry can contain `;`, `:` and `,`. An entry with these characters is written in double quotes, such as `TYPE="A;B"`. An entry with a double quote (`"`) or a control character other than tab, such as a line break, throws a `VCardException`.

### Address

| Method                                                                                                 | Description                                                                                                         |
| ------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------- |
| `addAddress({ street?, locality?, region?, postalCode?, country?, postOfficeBox?, extended?, type? })` | Structured address ([RFC 2426 §3.2.1][rfc2426-adr]). Type defaults to `['intl', 'postal', 'parcel', 'work']`        |
| `addLabel({ label, type? })`                                                                           | Formatted address label ([RFC 2426 §3.2.2][rfc2426-label]). Type defaults to `['intl', 'postal', 'parcel', 'work']` |

A `type` entry can contain `;`, `:` and `,`. An entry with these characters is written in double quotes. An entry with a double quote (`"`) or a control character other than tab, such as a line break, throws a `VCardException`.

### Social & Messaging

| Method                            | Description                                                                                                      |
| --------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `addSocial({ url, type, user? })` | Social profile. Writes both `X-SOCIALPROFILE` (iOS/macOS) and `IMPP` ([RFC 4770][rfc4770]), so more apps show it |
| `addImpp({ uri, serviceType? })`  | Instant messaging ([RFC 4770][rfc4770]), for protocols such as XMPP and SIP                                      |

```js
// Social profiles (writes X-SOCIALPROFILE and IMPP)
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

`type`, `user` and `serviceType` can contain `;`, `:` and `,`. A value with these characters is written in double quotes, such as `type="My Site;x"`. A value with a double quote (`"`) or a control character other than tab, such as a line break, throws a `VCardException`.

A `url` or `uri` with a control character also throws a `VCardException`.

### Geographic

| Method                            | Description                                                                                                                                                                                                                                                |
| --------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `addGeo({ latitude, longitude })` | Geographic coordinates ([RFC 2426 §3.4.2][rfc2426-geo]). Both values must be finite numbers. Latitude must be from -90 to 90 and longitude from -180 to 180. Throws `VCardException` otherwise                                                             |
| `addTimezone(timezone)`           | Time zone ([RFC 2426 §3.4.1][rfc2426-tz]). A UTC offset (`-05:00`) or an IANA name (`America/New_York`). An offset with an hour above `23` or a minute above `59`, such as `+24:00`, throws `VCardException`. Other values are written as text (see below) |

For `addTimezone()`, a UTC offset (`+HH:MM` or `-HH:MM`) is written as it is (`TZ:-05:00`).
Its hours must be `00` to `23` and its minutes `00` to `59`, so `+24:00` and `+05:60` throw `VCardException`.
Any other value, such as an IANA name, is written with `VALUE=text` (`TZ;VALUE=text:America/New_York`), as the RFC asks.
These text values are escaped like other text properties (see [Text Escaping](#text-escaping)).

### Media

| Method                       | Description                                        |
| ---------------------------- | -------------------------------------------------- |
| `addPhoto({ url })`          | Photo by URL ([RFC 2426 §3.1.4][rfc2426-photo])    |
| `addPhoto({ image, mime? })` | Photo as base64 content. `mime` defaults to `JPEG` |
| `addLogo({ url })`           | Logo by URL ([RFC 2426 §3.5.3][rfc2426-logo])      |
| `addLogo({ image, mime? })`  | Logo as base64 content. `mime` defaults to `JPEG`  |

Each method accepts either `{ url }` or `{ image, mime? }`. You can add more than one photo or logo, for example a base64 thumbnail and a URL. A `url` with a control character, such as a line break, throws a `VCardException`.

`image` must be base64 ([RFC 2045 §6.8][rfc2045-base64]): `A-Z`, `a-z`, `0-9`, `+` and `/`, with `=` padding. Spaces, tabs, CR and LF are removed, so wrapped output such as GNU `base64` works. Any other value throws a `VCardException`.

- `mime` is the image subtype, such as `'png'` or `'jpeg'`. The file extension `'jpg'` and full MIME types, such as `'image/png'` from `File.type`, also work. Leading and trailing whitespace (space, tab, CR, LF) and MIME parameters (`'image/png; charset=binary'`) are removed. `'jpg'` writes `TYPE=JPEG`.
- The subtype must be an [IANA image type][mime-types] or a non-standard `x-` name, such as `'image/x-icon'` (`TYPE=X-ICON`). Anything else throws a `VCardException`, for example `'image/pjpeg'`. The match ignores case.
- An empty `mime` (`''`, which browsers return for an unknown `File.type`) writes no `TYPE` parameter. So does a `mime` that is empty after whitespace and parameters are removed, such as `'  '` or `'; charset=binary'`. Leave out `mime` to get `TYPE=JPEG`.
- Pass raw base64 only. A `data:image/...;base64,` prefix (for example from `FileReader.readAsDataURL()` or `canvas.toDataURL()`) throws a `VCardException`. Its message says to remove the prefix and pass the MIME type as `mime`.

```js
import { readFileSync } from 'fs'
import VCard from 'vcard-creator'

const image = readFileSync('./path/to/sample.jpg', { encoding: 'base64' })

const vCard = new VCard()
vCard.addPhoto({ image, mime: 'JPEG' })
vCard.addPhoto({ url: 'https://example.com/photo.jpg' })
```

### Security

| Method                    | Description                                                                                                |
| ------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `addKey({ url })`         | Public key by URL ([RFC 2426 §3.7.1][rfc2426-key])                                                         |
| `addKey({ key, mime? })`  | Public key as base64. `mime` defaults to `PGP`                                                             |
| `addKey({ text, mime? })` | Public key as text, such as an ASCII-armoured PGP key. Written with `VALUE=text`. `mime` defaults to `PGP` |

For `addKey()`, `mime` is free text, such as `PGP` or `X509`. An empty `mime` writes no `TYPE`. A `mime` with `;`, `:` or `,` is written in double quotes. A `mime` with a double quote (`"`) or a control character other than tab throws a `VCardException`. `key` must be base64, with the same rules as a photo `image`. `text` is escaped like other text values (see [Text Escaping](#text-escaping)), so line breaks are written as `\n`. A `url` with a control character, such as a line break, throws a `VCardException`.

```js
// PGP key by URL
vCard.addKey({ url: 'https://example.com/key.pub' })

// ASCII-armoured PGP key
vCard.addKey({ text: armoredKey })

// Embedded X.509 certificate
vCard.addKey({ key: base64cert, mime: 'X509' })
```

### Other

| Method                      | Description                                                                                                                                         |
| --------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| `addUid(uid)`               | Unique identifier. Escaped as RFC 2426 text (see [Text Escaping](#text-escaping))                                                                   |
| `addCategories(categories)` | Categories or tags. Accepts `string[]`                                                                                                              |
| `addNote(note)`             | Free-text note                                                                                                                                      |
| `addSortString(sortString)` | Sort key for name order ([RFC 2426 §3.6.5][rfc2426-sort]). Useful for CJK names                                                                     |
| `addRevision(date)`         | Revision timestamp. Accepts `Date`. Replaces the automatic `REV`. Written in UTC without a fraction of a second, such as `REV:2024-01-15T10:30:00Z` |

### Custom Properties

For any property that has no built-in method, use `addCustomProperty()`:

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

The property name is changed to upper case. Values and `params` are **not** escaped. You must escape special characters (`;`, `,`, `\`) in custom property values yourself. Write a line break as `\n`.
`name` and `group` may contain only ASCII letters, digits and `-`, as [RFC 2425][rfc2425] requires. Any other character throws a `VCardException`.
A control character, such as a raw line break, in `value` or `params` throws a `VCardException`. A tab is allowed in `value` and `params`.
`params` must be `name=value` pairs separated by `;`, such as `TYPE=work,home;X-A=1`. Separate the values of one parameter with `,`. Put a value with `;`, `:` or `,` in double quotes, such as `X-L="a:b"`. A value cannot contain a double quote. A bare parameter, such as `WORK` (vCard 2.1 style), or any other text that breaks the [RFC 2426][rfc2426] grammar throws a `VCardException`.
The names `BEGIN`, `END`, `VERSION`, `PRODID` and `REV` throw a `VCardException`. The check ignores case. Use `addRevision()` with a `Date` to set `REV`.

### Property Grouping

Apple Contacts uses property groups for custom labels. Use the `group` option of `addCustomProperty()`:

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

Built-in methods escape special characters per [RFC 2426][rfc2426]:

- Backslash (`\`) → `\\`
- Semicolon (`;`) → `\;`
- Comma (`,`) → `\,`
- Line breaks (`\r\n`, `\n`, a lone `\r`, VT (`\x0B`), FF (`\x0C`), NEL (`\x85`), U+2028 and U+2029) → `\n`

This applies to text values in `addFullName`, `addName`, `addAddress`, `addCompany`, `addNickname`, `addCategories`, `addJobtitle`, `addRole`, `addNote`, `addLabel`, `addSortString`, `addTimezone` (text values only), `addEmail` (address), `addKey` (`text`) and `addUid`.
Leading and trailing spaces are kept, also in each `addNickname` and `addCategories` entry.
A text value with DEL (`\x7F`) or a C0 control character (`\x00` to `\x1F`) other than tab, CR, LF, VT or FF throws a `VCardException`. The other C1 control characters (`\x80` to `\x84` and `\x86` to `\x9F`) are allowed in text values.

Other values are written as they are. They throw a `VCardException` if they contain a control character: `\x00` to `\x1F`, `\x7F`, C1 (`\x80` to `\x9F`, including NEL), U+2028 (line separator) or U+2029 (paragraph separator). Some parsers treat these as line breaks. This applies to:

- `addPhoneNumber` number
- `addBirthday` string
- `addCustomProperty` value and `params` (a tab is allowed in both)
- URLs and URIs
- the deprecated `charset` (checked by `toString()`, a tab is allowed)

`addKey` key and `addPhoto` and `addLogo` image must be base64 (see [Media](#media)). Spaces, tabs, CR and LF are removed. Any other control character in them throws a `VCardException`.

Parameter values (`type` entries, `addKey` `mime`, `user`, `serviceType` and the deprecated `charset`) are written in double quotes when they contain `;`, `:` or `,`. A double quote or a control character other than tab throws a `VCardException`.

`addCustomProperty` `name` and `group` may contain only ASCII letters, digits and `-`.

### Error Handling

`VCardException` is thrown for invalid input: a second call to a once-only method, an options argument that is missing (except for `addAddress()` and `addName()`) or is not an object, a value that is not a string where the method expects one (or a `type` or `categories` that is not an array), an invalid `Date`, a phone number that is not finite, a birthday string that is not an RFC 2425 date or date-time, a date that does not exist, a `Date` with a year outside `0000` to `9999`, an invalid MIME type, an `image` or `key` that is not base64, coordinates that are not finite numbers or are out of range, a UTC offset out of range, a text value with DEL or a C0 control character other than tab, CR, LF, VT or FF, a value that is written as it is and contains a control character, a parameter value (`type` entry, `mime`, `user`, `serviceType` or `charset`) with a double quote or a control character other than tab, `addCustomProperty` `params` that are not `name=value` pairs, a property name or group with a character other than a letter, digit or `-`, or a reserved property name (`BEGIN`, `END`, `VERSION`, `PRODID` or `REV`).

The message names the property and shows the rejected value in quotes, with control characters written as `\uXXXX`, such as `Note values cannot contain control characters ("a\u0000b")`. A value longer than 64 characters is cut to its first 64 characters, followed by its length, such as `Image values must be base64 (got "AAAA…"... (length 10000))`.

`VCardException` is exported, so you can catch it:

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

### Single and Repeatable Properties

You can call these methods more than once:
`addAddress`, `addCustomProperty`, `addEmail`, `addImpp`, `addKey`, `addLabel`, `addLogo`, `addNickname`, `addNote`, `addPhoneNumber`, `addPhoto`, `addSocial`, `addUrl`.

You can call these methods only once. A second call throws a `VCardException`:
`addName`, `addFullName`, `addBirthday`, `addCompany`, `addJobtitle`, `addRole`, `addCategories`, `addGeo`, `addTimezone`, `addUid`, `addSortString`, `addRevision`.

### Multi-Contact Files

Combine several vCards into one `.vcf` file, for example to export an address book. It works like `Array.prototype.concat`, but returns a `string`:

```js
import VCard from 'vcard-creator'

const card1 = new VCard()
  .addName({ givenName: 'Alice', familyName: 'Smith' })
  .addEmail({ address: 'alice@example.com' })

const card2 = new VCard()
  .addName({ givenName: 'Bob', familyName: 'Jones' })
  .addEmail({ address: 'bob@example.com' })

// Instance: "this" card comes first
const output = card1.concat(card2)

// Static: combines the cards in order
const combined = VCard.concat(card1, card2)
```

Each card keeps its own `BEGIN:VCARD` and `END:VCARD` lines.

### Advanced Methods

Most users do not need these. The members marked **Deprecated** are removed in the next major version ([#107][issue-107]).

| Method                                             | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| -------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `toString()`                                       | Returns the vCard text. Use this in most cases                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| `buildVCard()`                                     | **Deprecated**: use `toString()`. Same as `toString()`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| `getProperties()`                                  | Returns the properties as `{ key, value, group? }` objects. Values are already escaped                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| `hasProperty(key)`                                 | **Deprecated**: use `getProperties().some((p) => p.key === key)` for the same exact match. To match the property name only, compare `p.key.split(';')[0]`. Returns `true` if a property has this exact key. The key includes parameters: use `'TEL;TYPE=WORK'`, not `'TEL'`                                                                                                                                                                                                                                                                                                                                                                                                      |
| `getContentType()`                                 | Returns `'text/vcard'`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| `getFilename()` / `setFilename(name)`              | **Deprecated**: choose the file name in your code. The library never saves files. Gets or sets a stored file name (default `'vcard'`). It does not change the output                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| `getFileExtension()`                               | **Deprecated**: use the literal `'vcf'`. Returns `'vcf'`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| `getCharset()` / `setCharset(charset)` / `charset` | **Deprecated**: the output is always a UTF-8 string. Encode the file yourself if you need another charset. Gets or sets the charset (default `'utf-8'`). Any other value adds `;CHARSET=<value>` to `N`, `FN`, `NICKNAME`, `ORG`, `TITLE`, `ROLE`, `NOTE`, `CATEGORIES`, `SORT-STRING`, `ADR` and `LABEL`. `EMAIL`, `UID` and `TZ` never get it. RFC 2426 has no `CHARSET` parameter. The check is case-sensitive, so `'UTF-8'` also adds it. It does not change the encoding. A value with `;`, `:` or `,` is written in double quotes. A double quote makes `toString()` and `getCharsetString()` throw. `setCharset()` does not check it, because `charset` is a public field |
| `getCharsetString()`                               | **Deprecated**: no replacement. Returns `;CHARSET=<value>` when the charset is not `'utf-8'`, and an empty string otherwise. The value is in double quotes when it contains `;`, `:` or `,`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |

Also deprecated, and removed in the next major version ([#156][issue-156]):

- a `number` as the `addPhoneNumber()` `number`. Pass a string.
- the `DateString` type. Use `string`.

## Migration from v0.x

For the previous API documentation, see the [v0.11.0 README][readme-v0.11].

Key changes in v1.0:

- **ESM only**: `require('vcard-creator')` is no longer supported
- **Object params only**: positional arguments have been removed
- **Merged media methods**: `addPhotoUrl()`/`addLogoUrl()` merged into `addPhoto({ url })`/`addLogo({ url })`
- **`addGeo(lat, lon)`** → `addGeo({ latitude, longitude })`
- **`addFullName()`**: new method to set FN directly. Call it before `addName()`
- **`addKey()`**: new method for public encryption keys (PGP, X.509)
- **Multiple instances**: `photo`, `logo`, `note`, `nickname` and `key` now allow more than one call
- **Content-Type**: `getContentType()` returns `text/vcard` (was `text/x-vcard`)
- **`EmailType`**: added `'internet'` per RFC 2426
- **vCalendar format removed**: use `new VCard()` (no format parameter)
- **CHARSET no longer added by default**: `CHARSET=utf-8` is not added to properties (vCard 3.0 uses UTF-8)
- **Text escaping**: special characters are now escaped per RFC 2426
- **`addBirthday`**: accepts a `Date` or a `'YYYY-MM-DD'` string (was `string` only)
- **`getProperties()`**: returns values that are already escaped, as written to the file
- **`concat()`**: new method for multi-contact `.vcf` files (static and instance)

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for setup, build and tests, and [ARCHITECTURE.md](ARCHITECTURE.md) for the source layout and how a property is added.

## License

[MIT](LICENSE)

<!-- References -->

[issue-41]: https://github.com/joaocarmo/vcard-creator/issues/41
[issue-43]: https://github.com/joaocarmo/vcard-creator/issues/43
[issue-107]: https://github.com/joaocarmo/vcard-creator/issues/107
[issue-156]: https://github.com/joaocarmo/vcard-creator/issues/156
[jeroendesloovere]: https://github.com/jeroendesloovere/vcard
[mime-types]: https://www.iana.org/assignments/media-types/media-types.xhtml#image
[rfc2045-base64]: https://tools.ietf.org/html/rfc2045#section-6.8
[rfc2425]: https://tools.ietf.org/html/rfc2425#section-5.8.2
[rfc2426]: https://tools.ietf.org/html/rfc2426
[rfc2426-adr]: https://tools.ietf.org/html/rfc2426#section-3.2.1
[rfc2426-fn]: https://tools.ietf.org/html/rfc2426#section-3.1.1
[rfc2426-geo]: https://tools.ietf.org/html/rfc2426#section-3.4.2
[rfc2426-key]: https://tools.ietf.org/html/rfc2426#section-3.7.1
[rfc2426-label]: https://tools.ietf.org/html/rfc2426#section-3.2.2
[rfc2426-logo]: https://tools.ietf.org/html/rfc2426#section-3.5.3
[rfc2426-n]: https://tools.ietf.org/html/rfc2426#section-3.1.2
[rfc2425-datetime]: https://tools.ietf.org/html/rfc2425#section-5.8.4
[rfc2426-photo]: https://tools.ietf.org/html/rfc2426#section-3.1.4
[rfc2426-sort]: https://tools.ietf.org/html/rfc2426#section-3.6.5
[rfc2426-tz]: https://tools.ietf.org/html/rfc2426#section-3.4.1
[readme-v0.11]: https://github.com/joaocarmo/vcard-creator/blob/v0.11.0/README.md
[rfc4770]: https://tools.ietf.org/html/rfc4770
