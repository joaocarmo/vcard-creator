# Architecture

This file is a map of the source code. It says where things live and how a property travels from a method call to the output.

## How a property is added

1. A public `add*()` method in `lib/VCard.ts` maps its arguments to 1 or more property inputs and passes them to `storeProperties()`.
2. `storeProperties()` handles each input:
   - It checks that an options argument is an object (`validate.ts`).
   - It reads the element's row in `PROPERTIES` (`properties.ts`): the property name, the default value type, whether the property can repeat and whether it takes the charset.
   - It runs the value pipeline for the value type (`VALUE_PIPELINES` in `values.ts`). The pipeline checks the value and returns the text to write.
   - It builds the property key with `buildKey()` (`format.ts`). `buildKey()` quotes the parameters and adds `VALUE=` when the value type is not the default one.
   - It checks the group name, and that a property allowed once is not added twice.

   Nothing is stored when a step throws.

3. `toString()` writes `BEGIN`, `VERSION`, `PRODID`, `REV` (when no revision was added), each stored property and `END`. `fold()` (`format.ts`) folds each line at 75 octets.

## Modules

Each module in `lib/` has 1 job:

- `index.ts`: the public exports.
- `VCard.ts`: the `VCard` class.
- `VCardException.ts`: the error class.
- `types/VCard.ts`: the public types.
- `constants.ts`: library metadata, such as the version and the content type.
- `properties.ts`: the property table, reserved property names and the property model types.
- `values.ts`: value pipelines, which check and convert a value by its value type.
- `validate.ts`: input checks and the RFC 2425 date grammar.
- `format.ts`: content-line output: text escaping, parameter quoting, property keys, line folding and number formatting.
- `mime.ts`: the image MIME type list and its helpers.

## Adding a property

1. Add the element name to `Element` in `types/VCard.ts`.
2. Add its row to `PROPERTIES` in `properties.ts`. The type check fails until every element has a row.
3. Add a public `add*()` method to `VCard` that maps its arguments to `storeProperties()`.
