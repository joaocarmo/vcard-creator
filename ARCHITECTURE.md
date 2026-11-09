# Architecture

This file is a map of the source code. It says where things live and how a property travels from a method call to the output.

See [CONTRIBUTING.md](CONTRIBUTING.md) for setup, build and tests.

## How a property is added

1. A public `add*()` method in `lib/VCard.ts` maps its arguments to 1 or more property inputs and passes them to `storeProperties()`.
2. `storeProperties()` handles each input:
   - It checks that an options argument is an object (`validate.ts`).
   - It reads the element's row in `PROPERTIES` (`properties.ts`): the property name, the default value type, whether the property can repeat, whether it takes the charset and the label that error messages use.
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
- `validate.ts`: input checks, the RFC 2425 date grammar and the base64 alphabet.
- `format.ts`: content-line output: text escaping, parameter quoting, property keys, line folding and number formatting.
- `mime.ts`: the image MIME type list and its helpers.

## Adding a property

1. Add the element name to `Element` in `types/VCard.ts`.
2. Add its row to `PROPERTIES` in `properties.ts`. The type check fails until every element has a row.
3. Add a public `add*()` method to `VCard` that maps its arguments to `storeProperties()`.
4. Add its entry to `cases` in `VCard.input.test.ts` and its output to the mapping table in `VCard.properties.test.ts`. The type check fails until `cases` has an entry for every `add*()` method.

## Tests

- Unit tests sit next to their module, in files named after it: `<module>.test.ts`. A large module can split its tests by topic into `<module>.<topic>.test.ts`. The topics do not overlap.
- Each behaviour is tested in 1 place. The value-type rules (escaping, control characters, the date grammar, base64) are tested in the module that owns them: `values.test.ts`, `validate.test.ts` and `format.test.ts`. These tests check which values a rule rejects. The `VCard` tests check the error messages, through the public methods.
- `VCard` tests:
  - `VCard.test.ts`: the class itself, such as output, charset, `concat()` and grouping.
  - `VCard.properties.test.ts`: what each `add*()` method writes (property name, parameters and value type), plus behaviour that only that method has.
  - `VCard.input.test.ts`: checks that run over every input of every `add*()` method. 1 table, `cases`, lists the inputs of each method.
- Test fixtures live in `test/fixtures/`. `test/fixtures/index.ts` loads them, so each test file imports a fixture by name.
- Shared test setup lives in `test/helpers.ts`: `freezeTime()` fixes the clock for a suite, and `addMethods` lists the public `add*()` methods for the guard tests. Vitest restores `vi.spyOn()` spies after each test (`restoreMocks`).
- The functional test lives in `test/functional/`. It tests the built package in `dist/`, with its own Vitest config (`vitest.functional.config.ts`).
- The smoke test lives in `test/smoke/`. It is a plain `node` script with no dependencies that runs `dist/` on the oldest supported Node.js versions. `CONTRIBUTING.md` lists the versions.
