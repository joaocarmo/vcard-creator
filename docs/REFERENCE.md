# Reference

The rules that apply across methods. Rules for a single method are in its JSDoc and option types, which your editor shows.

- [Output format](#output-format)
- [Text values](#text-values)
- [Other values](#other-values)
- [Parameters](#parameters)
- [Images and keys](#images-and-keys)
- [Departures from RFC 2426](#departures-from-rfc-2426)
- [Custom properties and groups](#custom-properties-and-groups)
- [Errors](#errors)

## Output format

- Lines end with CRLF (`\r\n`), as [RFC 2425][rfc2425] requires.
- Lines longer than 75 octets are folded. Folding never splits a UTF-8 character.
- `VERSION`, `PRODID` and `REV` are added for you. `REV` is the time `toString()` runs, in UTC, unless you set it with `addRevision()`.

## Text values

Free-text values, such as names, addresses, notes and email addresses, are escaped as [RFC 2426][rfc2426] requires:

| Input                                                                              | Written as |
| ---------------------------------------------------------------------------------- | ---------- |
| `\`                                                                                | `\\`       |
| `;`                                                                                | `\;`       |
| `,`                                                                                | `\,`       |
| a line break: CRLF, LF, CR, VT (`\x0B`), FF (`\x0C`), NEL (`\x85`), U+2028, U+2029 | `\n`       |

Leading and trailing spaces are kept. DEL (`\x7F`) and the other C0 control characters (`\x00` to `\x1F`, except tab) throw.

## Other values

Phone numbers, URLs, URIs and custom property values are written as they are. A control character in them throws (`\x00` to `\x1F`, `\x7F` to `\x9F`, U+2028 and U+2029), because some parsers read these as line breaks. Custom property values allow a tab. Pass a `URL` object as `url.href`.

## Parameters

Parameter values, such as `type` entries, are written in double quotes when they contain `;`, `:` or `,`, such as `TYPE="A;B"`. A double quote or a control character other than tab throws: RFC 2426 allows them in no parameter value.

## Images and keys

`addPhoto()`, `addLogo()` and `addKey()` take a `url` or base64 data. `image` and `key` must be base64 ([RFC 2045 §6.8][rfc2045-base64]); line breaks and spaces are removed, so wrapped output such as GNU `base64` works. A `data:` URL, such as `canvas.toDataURL()` output, throws: remove the `data:…;base64,` prefix and pass the type as `mime`.

```js
import { readFileSync } from 'node:fs'

card.addPhoto({ image: readFileSync('photo.jpg', 'base64'), mime: 'jpeg' })
card.addPhoto({ url: 'https://example.com/photo.jpg' })
```

For photos and logos, `mime` accepts `'png'`, `'jpg'` or a full MIME type such as `File.type`. It must be in the [IANA image registry][mime-types] or start with `x-`; anything else, such as `'image/pjpeg'`, throws. Leaving it out writes `TYPE=JPEG`. An empty `mime`, which browsers give for an unknown file, writes no `TYPE`.

## Departures from RFC 2426

The library writes what you pass in these 2 cases, which vCard 4.0 ([RFC 6350][rfc6350]) allows:

- RFC 2426 allows 1 email type, optionally followed by `pref`, such as `['work', 'pref']`. More types are written as given.
- RFC 2426 allows no type on `URL`. A `type` is written as given, such as `URL;TYPE=WORK:…`.

For strict RFC 2426 output, leave out `type`, or pass 1 email type followed by `'pref'`.

## Custom properties and groups

`addCustomProperty()` writes any property that has no built-in method. Its value and `params` are written as given, so escape `\`, `;` and `,` yourself. A group joins related properties; Apple Contacts uses groups for custom labels:

```js
card
  .addCustomProperty({ name: 'TEL', value: '+1-555-1234', group: 'item1' })
  .addCustomProperty({ name: 'X-ABLabel', value: 'Work Phone', group: 'item1' })
```

```txt
item1.TEL:+1-555-1234
item1.X-ABLABEL:Work Phone
```

## Errors

Invalid input throws a `VCardException`, and the card stays as it was. Every message has the form `<Label> values must … (got …)`. The label names the property, such as `URL` or `Geo latitude`. After `got`, a string shows as JSON (a tab shows as `\t`), and a value longer than 64 characters is cut. Some messages end with a hint:

```txt
URL values must not contain control characters (got "a\tb")
Geo latitude values must be -90 to 90 (got 91)
Revision values must be Dates (got string)
```

<!-- References -->

[mime-types]: https://www.iana.org/assignments/media-types/media-types.xhtml#image
[rfc2045-base64]: https://tools.ietf.org/html/rfc2045#section-6.8
[rfc2425]: https://tools.ietf.org/html/rfc2425
[rfc2426]: https://tools.ietf.org/html/rfc2426
[rfc6350]: https://tools.ietf.org/html/rfc6350
