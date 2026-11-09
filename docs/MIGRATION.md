# Migration guide

- [Deprecated in v1](#deprecated-in-v1): members that the next major version removes.
- [From v0.x to v1](#from-v0x-to-v1)

## Deprecated in v1

These members still work in v1. Your editor marks them as deprecated. The next major version removes them ([#156][issue-156]).

| Deprecated                                         | Use instead                                                                       |
| -------------------------------------------------- | --------------------------------------------------------------------------------- |
| `buildVCard()`                                     | `toString()`                                                                      |
| `hasProperty(key)`                                 | `getProperties().some((p) => p.key === key)`                                      |
| `getFilename()`, `setFilename()`                   | Choose the file name in your code. The library never saves files.                 |
| `getFileExtension()`                               | The literal `'vcf'`                                                               |
| `charset`, `getCharset()`, `setCharset()`          | Nothing. The output is always a UTF-8 string. Encode the file yourself if needed. |
| `getCharsetString()`                               | Nothing. The output never has a `CHARSET` parameter unless you set one.           |
| A JavaScript number as `addPhoneNumber()` `number` | A string, such as `'+15550100'`                                                   |
| The `DateString` type                              | `string`                                                                          |

Notes:

- `hasProperty()` matches the whole key, parameters included, such as `'TEL;TYPE=WORK'`. To match the property name only, compare `p.key.split(';')[0]`.
- A phone number as a JavaScript number loses a leading `0` and the `+` sign ([#43][issue-43]). `1e21` is written as `1e+21`, and integers above `Number.MAX_SAFE_INTEGER` change their last digits.
- A `charset` other than `'utf-8'` adds `;CHARSET=<value>` to text properties, except `EMAIL`, `UID` and `TZ`. RFC 2426 has no `CHARSET` parameter. The check is case-sensitive, so `'UTF-8'` also adds it. A double quote in it makes `toString()`, `buildVCard()`, `concat()` and `getCharsetString()` throw.

## From v0.x to v1

The [v0.11.0 README][readme-v0.11] documents the old API.

- **ESM only**: `require('vcard-creator')` no longer works. Use `import`.
- **Options objects**: methods with more than 1 argument take 1 options object.
  - `addGeo(lat, lon)` → `addGeo({ latitude, longitude })`
  - `addPhotoUrl()` and `addLogoUrl()` → `addPhoto({ url })` and `addLogo({ url })`
- **New methods**:
  - `addFullName()` sets `FN`. Call it before `addName()`.
  - `addKey()` adds a public key (PGP or X.509).
  - `concat()` joins cards into 1 multi-contact file (static and instance).
- **Repeatable properties**: `addPhoto()`, `addLogo()`, `addNote()`, `addNickname()` and `addKey()` can be called more than once.
- **Content type**: `getContentType()` returns `text/vcard` (was `text/x-vcard`).
- **`EmailType`**: adds `'internet'`, as RFC 2426 defines it.
- **vCalendar removed**: `new VCard()` takes no format argument.
- **No default `CHARSET`**: properties no longer get `CHARSET=utf-8`. vCard 3.0 is UTF-8.
- **Text escaping**: special characters are escaped as RFC 2426 requires.
- **`addBirthday()`**: accepts a `Date`, or a date or date-time string in the RFC 2425 format, such as `1990-05-15`, `19900515` or `1953-10-15T23:10:00Z`.
- **`getProperties()`**: returns values already escaped, as written to the file.

<!-- References -->

[issue-43]: https://github.com/joaocarmo/vcard-creator/issues/43
[issue-156]: https://github.com/joaocarmo/vcard-creator/issues/156
[readme-v0.11]: https://github.com/joaocarmo/vcard-creator/blob/v0.11.0/README.md
