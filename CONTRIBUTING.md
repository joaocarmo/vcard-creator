# Contributing

Use the Node.js version in `.nvmrc` (Node.js 26): the unit tests use its built-in `Temporal`. Install [pnpm](https://pnpm.io/installation), which Node.js 25 and later no longer include, then run `pnpm install`.

## Checks

Run these before you open a PR. CI runs the same checks.

```sh
pnpm build
pnpm test:coverage    # unit tests; coverage of lib/ must stay at 100%
pnpm test:functional  # type checks and runs the test against dist/
pnpm test:smoke       # runs dist/ with plain node
pnpm lint
pnpm type-check
pnpm pretty
```

`pnpm test:unit` runs the unit tests without coverage, so a filtered run such as `pnpm test:unit lib/index.test.ts` works.

CI runs the smoke test on Node.js 18 and 20, the oldest version `engines` allows and the next major's minimum. `tsconfig.build.json` targets ES2022 so that `dist/` runs there.

## Design rules

- Follow [RFC 2425][rfc2425] and [RFC 2426][rfc2426]: accept every form they allow, and throw a `VCardException` only for what they forbid. Where the library departs from them on purpose, `docs/REFERENCE.md` says so.
- Give a function an options object when 2 or more of its parameters could be swapped, such as 2 strings.
- Semantic versioning:
  - patch: a bug fix, including a fix that makes the output or the input checks follow the RFCs;
  - minor: new API, or a deprecation;
  - major: a removal. Deprecate first, and add the removal to the next-major tracking issue.
- Code, comments and commit messages use American English. Docs, PRs and issues use British English, short sentences and digits for quantities.
- A comment says only what the code cannot show. Leave ticket IDs, dates and history out of comments and test names, except in `TODO(#123)`. A reason for leaving something out goes in the commit or PR, not in a comment.
- Test names start with "should".
- A new dependency needs a reason that a few lines of code cannot cover, and a healthy project: recent releases, active maintenance and wide use on GitHub and npm.
- GitHub Actions are pinned to a commit SHA, with the version in a comment, such as `uses: actions/checkout@<sha> # v7.0.1`.

## Release

The release tag is the only source of the version. On `main`, `package.json` and `LIB_VERSION` stay at `0.0.0-development`.

1. Create a GitHub release on `main` with tag `vX.Y.Z` and publish it. A tag on another branch fails the workflow. A pre-release publishes with the npm dist-tag `next`, a release with `latest`.
2. The `Publish` workflow runs all checks on the tagged commit, writes the version from the tag into `package.json` and `LIB_VERSION`, builds and publishes to npm. It removes the `prepare` script before it publishes, so the package on npm does not set up Git hooks.
3. Check the workflow run and the version on npm. If the publish step fails for an external reason, use "Re-run failed jobs": it runs on the same commit. If a check fails, fix it on `main` and release a new version.

## Documentation

Each fact lives in 1 place:

- JSDoc and the option types in `lib/types/VCard.ts`: what a method writes and the rules for its options. Editors show them.
- `docs/REFERENCE.md`: rules that apply to more than 1 method, such as escaping, parameters and errors.
- `docs/MIGRATION.md`: breaking changes and deprecated members, with what to use instead.
- `README.md`: what the library does, installation, a quick start and the method list. It links to the rest.

Markdown files keep link references at the end, after a `<!-- References -->` comment, and use no em dashes.

A new deprecation gets a `@deprecated` tag that says what to use instead and that the next major version removes it, a row in `docs/MIGRATION.md` and an entry in the next-major tracking issue.

[ARCHITECTURE.md](ARCHITECTURE.md) describes the source layout and how a property is added.

<!-- References -->

[rfc2425]: https://tools.ietf.org/html/rfc2425
[rfc2426]: https://tools.ietf.org/html/rfc2426
