## Object Params API & Standards-Aligned Naming

All multi-argument methods now accept self-documenting options objects. Field names align with [RFC 2426][rfc2426], [HTML autocomplete][html-auto], and [Schema.org][schema]. The old positional API still works but is deprecated.

### Before / After

```js
// Before (deprecated — positional args, wire format strings)
vCard.addName('Doe', 'John', '', 'Dr.')
vCard.addEmail('john@example.com', 'PREF;WORK')
vCard.addAddress(
  '',
  '',
  '123 Main St',
  'Springfield',
  'IL',
  '62701',
  'USA',
  'WORK;POSTAL',
)

// After (recommended — named fields, typed arrays)
vCard.addName({ givenName: 'John', familyName: 'Doe', honorificPrefix: 'Dr.' })
vCard.addEmail({ address: 'john@example.com', type: ['pref', 'work'] })
vCard.addAddress({
  street: '123 Main St',
  locality: 'Springfield',
  region: 'IL',
  postalCode: '62701',
  country: 'USA',
})
```

### Standards-Aligned Field Names

| Before              | After                                 | Standard                                    |
| ------------------- | ------------------------------------- | ------------------------------------------- |
| `firstName`         | `givenName`                           | RFC 2426, Schema.org, Google/Apple Contacts |
| `lastName`          | `familyName`                          | RFC 2426 "Family Name"                      |
| `additional`        | `additionalNames`                     | HTML `additional-name`                      |
| `prefix` / `suffix` | `honorificPrefix` / `honorificSuffix` | HTML, Schema.org                            |
| `name` (address)    | `postOfficeBox`                       | RFC 2426 ADR first component                |
| `city`              | `locality`                            | RFC 2426 "Locality"                         |
| `zip`               | `postalCode`                          | RFC 2426, HTML `postal-code`                |

### Typed Arrays for `type`

Type parameters now accept typed arrays with IDE autocomplete instead of raw vCard wire format strings:

```js
type: ['work', 'postal'] // → TYPE=WORK,POSTAL in output
type: ['cell'] // → TYPE=CELL in output
```

### Wire Format Change

Type output normalized from vCard 2.1 to correct 3.0 format:

```
Before: TEL;WORK;VOICE:+1555
After:  TEL;TYPE=WORK,VOICE:+1555
```

### Other Changes

- `VCardException` is now exported for consumer catch blocks
- `@link` RFC section references added to all public methods
- `addCustomProperty()` also accepts an options object
- Link to [v0.10.0 README][readme-v0.10] for previous API documentation

### Breaking Changes

- Wire format: `TEL;WORK` → `TEL;TYPE=WORK` (correct per RFC 2426, may affect exact string matching)

## What's Changed

- feat: object params API, typed arrays, and standards-aligned naming by @joaocarmo in https://github.com/joaocarmo/vcard-creator/pull/78

**Full Changelog**: https://github.com/joaocarmo/vcard-creator/compare/v0.10.0...v0.11.0

<!-- References -->

[html-auto]: https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#autofill
[readme-v0.10]: https://github.com/joaocarmo/vcard-creator/blob/v0.10.0/README.md
[rfc2426]: https://tools.ietf.org/html/rfc2426
[schema]: https://schema.org/Person
