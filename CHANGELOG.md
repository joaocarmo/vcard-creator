# Changelog

## 0.3.4

> Mar 21, 2021

- Fixes the exported typings ([#13](https://github.com/joaocarmo/vcard-creator/issues/13)) to have the same name as the distribution file

## 0.3.3

> Jan 31, 2021

- Fixes the exported typings ([#13](https://github.com/joaocarmo/vcard-creator/issues/13))

## 0.3.2

> Jan 9, 2021

- Fixes the [subpath exports](https://nodejs.org/api/packages.html#packages_subpath_exports)

## 0.3.1

> Jan 9, 2021

- Updated the TypeScript declaration file's output to match the name of the
  bundle (#11)

## 0.3.0 (no release)

> Nov 6, 2020

- Updated the documentation to include information about using the module in the
  browser (ESM)
- Updated the `package.json` to comply with ESM best practices
- Updated the dependencies

## 0.3.0

> Aug 9, 2020

- Added support for iCalendar data files

## 0.2.0

> Aug 8, 2020

- Converted to TypeScript
- Added unit and functional tests
- Updated the documentation (#1)

## 0.1.0 (no release)

> Aug 11, 2019

- Updated the dependencies to resolve the security vulnerability
  [CVE-2019-10744](https://github.com/lodash/lodash/pull/4336)

## 0.1.0

> Apr 1, 2019

- Changed the named export to a default export, making it incompatible with
  previous versions [BREAKING]
- Renamed the global object from `vcard_creator` to `vcardcreator` [BREAKING]
- Renamed the constructor `VCard` [BREAKING]

## 0.0.6

> Feb 8, 2019

- Updated the dependencies to resolve the security vulnerability in
  [lodash](https://nvd.nist.gov/vuln/detail/CVE-2018-16487)

## 0.0.5

> Jun 1, 2018

- Added tests for CLI, compiled for web (i.g. webpack) and not compiled (i.g.
  used from the global _window_ object)
- Updated the [README.md](README.md)

## 0.0.4

> Apr 26, 2018

- Exposed the library as a compiled bundle to avoid dependencies

## 0.0.3

> Apr 25, 2018

- Removed the _index.js_ and exposed the module directly from the _lib_ folder

## 0.0.2

> Sep 1, 2017

- Removed the _transliteration_ dependency in order to be compatible with
  _UglifyJS_

## 0.0.1

> Aug 31, 2017

- Removed the _locutus_ dependency
- Fixed the folding of long lines into multiple lines

## 0.0.0

> Aug 29, 2017

- Initial release
