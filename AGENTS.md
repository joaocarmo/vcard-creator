# AGENTS.md

Instructions for coding agents working on `vcard-creator`, a TypeScript library that writes vCard 3.0 files.

Read these first. They are the rules for every contributor:

- [CONTRIBUTING.md](CONTRIBUTING.md): setup, checks, design rules, documentation rules and releases.
- [ARCHITECTURE.md](ARCHITECTURE.md): how a property travels from a method call to the output, how to add a property, and where each test belongs.
- [docs/REFERENCE.md](docs/REFERENCE.md): the rules that apply across methods, including the error message form.

## Before you finish

Run the checks in [CONTRIBUTING.md](CONTRIBUTING.md#checks) and report each result.

## Pull requests

- Use the PR template in `.github/PULL_REQUEST_TEMPLATE.md`.
- List problems you found but did not fix under a "Related, not done" heading in the PR body, each with the file and line.
- Do not edit `dist/`, `pnpm-lock.yaml` by hand, or the version in `package.json` and `lib/constants.ts`. The release sets the version.
