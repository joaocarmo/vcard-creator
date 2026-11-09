# Reference

The rules that apply across methods. Rules for a single method are in its JSDoc and option types, which your editor shows.

- [Output format](#output-format)
- [Text values](#text-values)
- [Other values](#other-values)
- [Parameters](#parameters)
- [Images and keys](#images-and-keys)
- [Departures from RFC 2426](#departures-from-rfc-2426)
- [Custom properties](#custom-properties)
- [Property groups](#property-groups)
- [Multi-contact files](#multi-contact-files)
- [Errors](#errors)

## Output format

- Lines end with CRLF (`\r\n`), as [RFC 2425][rfc2425] requires.
- Lines longer than 75 octets are folded. Folding never splits a UTF-8 character.
- `VERSION`, `PRODID` and `REV` are added for you. `REV` is the time `toString()` runs, unless you set it with `addRevision()`. It is written in UTC without a fraction of a second, such as `REV:2024-01-15T10:30:00Z`.
- `addName()` writes `FN` from the name parts when the card has no `FN` yet. To choose the `FN` yourself, call `addFullName()` first.

## Text values

Most methods write text values: names, addresses, the company, notes, categories, the job title, the role, the sort string, the email address, the UID, a text key and a time zone name. Text is escaped as [RFC 2426][rfc2426] requires:

| Input                                                                              | Written as |
| ---------------------------------------------------------------------------------- | ---------- |
| `\`                                                                                | `\\`       |
| `;`                                                                                | `\;`       |
| `,`                                                                                | `\,`       |
| a line break: CRLF, LF, CR, VT (`\x0B`), FF (`\x0C`), NEL (`\x85`), U+2028, U+2029 | `\n`       |

Leading and trailing spaces are kept. DEL (`\x7F`) and the C0 control characters (`\x00` to `\x1F`) other than tab and the line breaks above throw. The other C1 control characters (`\x80` to `\x9F`) are allowed.

## Other values

Phone numbers, URLs, URIs and custom property values are written as they are. A control character in them throws: `\x00` to `\x1F`, `\x7F`, `\x80` to `\x9F`, U+2028 and U+2029. Some parsers read these as line breaks. Custom property values and `params` allow a tab. A birthday string must match the RFC 2425 date or date-time grammar, so it cannot contain one either.

URLs must be strings. Pass a `URL` object as `url.href`. Percent-encode a line break in a URL as `%0A`.

## Parameters

Parameter values, such as `type` entries, a key `mime`, `user` and `serviceType`, are written in double quotes when they contain `;`, `:` or `,`, such as `TYPE="A;B"`. A double quote or a control character other than tab throws, because RFC 2426 does not allow them in any parameter value.

## Images and keys

`addPhoto()` and `addLogo()` take either `{ url }` or `{ image, mime? }`. `addKey()` also takes `{ text, mime? }`. An option set to `undefined` counts as absent.

`image` and `key` must be base64 ([RFC 2045 §6.8][rfc2045-base64]). Spaces, tabs, CR and LF are removed, so wrapped output such as GNU `base64` works. A `data:` URL, such as `canvas.toDataURL()` output, throws: remove the `data:…;base64,` prefix and pass the type as `mime`.

```js
import { readFileSync } from 'node:fs'

card.addPhoto({ image: readFileSync('photo.jpg', 'base64'), mime: 'jpeg' })
card.addPhoto({ url: 'https://example.com/photo.jpg' })
```

For photos and logos, `mime` is the image type:

- It accepts a subtype (`'png'`), a full MIME type (`'image/png'`, such as `File.type`) or the extension `'jpg'`. Leading and trailing whitespace and MIME parameters (`'; charset=binary'`) are removed. The match ignores case.
- The type must be in the [IANA image registry][mime-types] or start with `x-`, such as `'image/x-icon'`. Anything else, such as `'image/pjpeg'`, throws.
- Leaving out `mime` writes `TYPE=JPEG`. An empty `mime` (`''`, which browsers return for an unknown file), or one that is empty after the removal above, writes no `TYPE`.

For keys, `mime` is the key type, such as `PGP` or `X509`, and defaults to `PGP`.

## Departures from RFC 2426

The library writes what you pass in these 2 cases, because contacts apps and vCard 4.0 ([RFC 6350][rfc6350]) use them:

- RFC 2426 allows 1 email type, optionally followed by `pref`, such as `['work', 'pref']`. More types are written as given.
- RFC 2426 allows no type on `URL`. A `type` is written as given, such as `URL;TYPE=WORK:…`.

For strict RFC 2426 output, leave out `type`, or pass 1 email type followed by `'pref'`.

## Custom properties

`addCustomProperty()` writes any property that has no built-in method:

```js
card.addCustomProperty({ name: 'X-PHONETIC-FIRST-NAME', value: 'Jon' })
card.addCustomProperty({
  name: 'X-CUSTOM',
  value: 'value',
  params: 'TYPE=work',
})
```

- The name is written in upper case. It may contain only ASCII letters, digits and `-`, as [RFC 2425][rfc2425] requires. `BEGIN`, `END`, `VERSION`, `PRODID` and `REV` throw: use `addRevision()` to set `REV`.
- The value is not escaped. Escape `\`, `;` and `,` yourself, and write a line break as `\n`.
- `params` must be `name=value` pairs separated by `;`, such as `TYPE=work,home;X-A=1`. Put a value with `;`, `:` or `,` in double quotes. A bare parameter, such as `WORK` (vCard 2.1 style), throws.
- An `FN` added this way stops `addName()` from writing its own `FN`.

## Property groups

A group joins properties that belong together. Apple Contacts uses groups for custom labels. Set `group` on `addCustomProperty()`:

```js
card
  .addCustomProperty({ name: 'TEL', value: '+1-555-1234', group: 'item1' })
  .addCustomProperty({ name: 'X-ABLabel', value: 'Work Phone', group: 'item1' })
```

```txt
item1.TEL:+1-555-1234
item1.X-ABLABEL:Work Phone
```

A group may contain only ASCII letters, digits and `-`. An empty group writes no prefix.

## Multi-contact files

`concat()` joins cards into 1 `.vcf` file, for example to export an address book. Each card keeps its own `BEGIN:VCARD` and `END:VCARD` lines.

```js
const alice = new VCard().addName({ givenName: 'Alice', familyName: 'Smith' })
const bob = new VCard().addName({ givenName: 'Bob', familyName: 'Jones' })

VCard.concat(alice, bob) // Alice, then Bob
alice.concat(bob) // the same: this card comes first
```

## Errors

Invalid input throws a `VCardException`. Nothing is stored when a call throws, so the card stays as it was.

A call throws when:

- a once-only method is called a second time;
- the options argument is not an object, or a required option is missing;
- a value has the wrong type, such as a number where a string is expected;
- a value breaks a rule on this page or in the method's JSDoc, such as a control character, an invalid date or an unknown image type.

The message names the property and shows the rejected value as a JSON string, so a tab shows as `\t`:

```txt
URL values cannot contain control characters ("a\tb")
X-A parameters must be name=value pairs separated by ";". …
```

A value longer than 64 characters is cut, and the message gives its length, such as `Photo values must be base64 (got "AAAA…"... (length 10000))`.

[mime-types]: https://www.iana.org/assignments/media-types/media-types.xhtml#image
[rfc2045-base64]: https://tools.ietf.org/html/rfc2045#section-6.8
[rfc2425]: https://tools.ietf.org/html/rfc2425
[rfc2426]: https://tools.ietf.org/html/rfc2426
[rfc6350]: https://tools.ietf.org/html/rfc6350
