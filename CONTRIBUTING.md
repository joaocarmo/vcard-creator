# Contributing

Use the Node.js version in `.nvmrc`: the unit tests use its built-in `Temporal`. Install [pnpm](https://pnpm.io/installation) (Node.js 25 and later no longer include Corepack). Then install the dependencies:

```sh
pnpm install
```

Build and test your changes:

```sh
# Build
pnpm build

# Unit tests with coverage
pnpm test:unit

# Functional test (uses dist/, so run pnpm build first)
pnpm test:functional

# Lint, type check and format check
pnpm lint
pnpm type-check
pnpm pretty
```

`pnpm test:unit` also measures test coverage of `lib/`. Coverage must stay at 100% for statements, branches, functions and lines. The command fails below 100%, and so does the `test` CI job.

`pnpm test:functional` runs Vitest against the built package in `dist/`. It writes no files.

[ARCHITECTURE.md](ARCHITECTURE.md) describes the source layout and how a property is added.
