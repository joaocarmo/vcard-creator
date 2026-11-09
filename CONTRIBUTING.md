# Contributing

Use the Node.js version in `.nvmrc`: the unit tests use its built-in `Temporal`. Install [pnpm](https://pnpm.io/installation) (Node.js 25 and later no longer include Corepack). Then install the dependencies:

```sh
pnpm install
```

Build and test your changes:

```sh
# Build
pnpm build

# Unit tests
pnpm test:unit

# Unit tests with coverage
pnpm test:coverage

# Functional test (uses dist/, so run pnpm build first)
pnpm test:functional

# Lint
pnpm lint

# Type check (checks the functional test against dist/, so run pnpm build first)
pnpm type-check

# Format check
pnpm pretty
```

`pnpm test:coverage` measures test coverage of `lib/`. Coverage must stay at 100% for statements, branches, functions and lines. The command fails below 100%, and so does the `test` CI job.

`pnpm test:unit` runs without coverage, so a filtered run such as `pnpm test:unit lib/index.test.ts` passes when its tests pass.

Before you open a PR, run `pnpm build`, `pnpm test:coverage`, `pnpm lint`, `pnpm type-check` and `pnpm pretty`.

## Documentation

Each fact lives in 1 place:

- JSDoc and the option types in `lib/types/VCard.ts`: what a method writes and the rules for its options. Editors show them.
- `docs/REFERENCE.md`: rules that apply to more than 1 method, such as escaping, parameters and errors.
- `docs/MIGRATION.md`: breaking changes and deprecated members, with what to use instead.
- `README.md`: what the library does, installation, a quick start and the method list. It links to the rest.

A new deprecation gets a `@deprecated` tag that says what to use instead and that the next major version removes it, a row in `docs/MIGRATION.md` and an entry in the next-major tracking issue.

[ARCHITECTURE.md](ARCHITECTURE.md) describes the source layout and how a property is added.
