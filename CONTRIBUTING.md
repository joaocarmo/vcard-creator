# Contributing

Use the Node.js version in `.nvmrc`: the unit tests use its built-in `Temporal`. Install [pnpm](https://pnpm.io/installation) (Node.js 25 and later no longer include Corepack). Then install the dependencies:

```sh
pnpm install
```

## Node.js versions in CI

- Lint, unit tests and the functional test run on the `.nvmrc` version (Node.js 26).
- The `smoke` job builds `dist/` on Node.js 26. It then runs `test/smoke/node.mjs` on Node.js 18 and 20: the oldest version `engines` allows, and the next major's minimum. The script uses no Vitest, because Vitest needs a newer Node.js.
- `tsconfig.build.json` sets `target: "ES2022"`, so `dist/` runs on Node.js 18.

## Build and test

Build and test your changes:

```sh
# Build
pnpm build

# Unit tests
pnpm test:unit

# Unit tests with coverage
pnpm test:coverage

# Functional test: type checks and runs it against dist/, so run pnpm build first
pnpm test:functional

# Smoke test: runs dist/ with plain node, so run pnpm build first
pnpm test:smoke

# Lint, type check and format check
pnpm lint
pnpm type-check
pnpm pretty
```

`pnpm test:coverage` measures test coverage of `lib/`. Coverage must stay at 100% for statements, branches, functions and lines. The command fails below 100%, and so does the `test` CI job.

`pnpm test:unit` runs without coverage, so a filtered run such as `pnpm test:unit lib/index.test.ts` passes when its tests pass.

Before you open a PR, run `pnpm build`, `pnpm test:coverage`, `pnpm test:functional`, `pnpm test:smoke`, `pnpm lint`, `pnpm type-check` and `pnpm pretty`.

## Release

1. Open a PR that sets the new version on `main` with `pnpm version:set vX.Y.Z`. Merge it.
2. Create a GitHub release on `main` with tag `vX.Y.Z` and publish it. A tag on another branch fails the workflow. A pre-release publishes with the npm dist-tag `next`, a release with `latest`.
3. The `Publish` workflow runs all checks on the tagged commit, sets the version from the tag and publishes to npm.
4. Check the workflow run and the version on npm. If the publish step fails for an external reason, use "Re-run failed jobs": it runs on the same commit. If a check fails, fix it on `main` and release a new version.

The published build takes its version from the tag, so it matches the tag even if step 1 was skipped. Step 1 keeps `main` in sync.

## Documentation

Each fact lives in 1 place:

- JSDoc and the option types in `lib/types/VCard.ts`: what a method writes and the rules for its options. Editors show them.
- `docs/REFERENCE.md`: rules that apply to more than 1 method, such as escaping, parameters and errors.
- `docs/MIGRATION.md`: breaking changes and deprecated members, with what to use instead.
- `README.md`: what the library does, installation, a quick start and the method list. It links to the rest.

A new deprecation gets a `@deprecated` tag that says what to use instead and that the next major version removes it, a row in `docs/MIGRATION.md` and an entry in the next-major tracking issue.

[ARCHITECTURE.md](ARCHITECTURE.md) describes the source layout and how a property is added.
