
## 0.1.0
> Apr 1, 2019

- Changed the named export to a default export, making it incompatible with
previous versions [BREAKING]
- Renamed the global object from `vcard_creator` to `vcardcreator`

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
