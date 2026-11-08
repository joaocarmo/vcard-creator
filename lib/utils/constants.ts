import { Element } from '../types/VCard.js'

export { MIME_TYPES } from './mime-types.js'

export const ALLOWED_MULTIPLE_PROPERTIES: ReadonlySet<Element> = new Set([
  'address',
  'custom',
  'email',
  'impp',
  'key',
  'label',
  'logo',
  'nickname',
  'note',
  'phoneNumber',
  'photo',
  'social',
  'url',
])

export const TEXT_ELEMENTS: ReadonlySet<Element> = new Set([
  'address',
  'categories',
  'company',
  'fullname',
  'jobtitle',
  'label',
  'name',
  'nickname',
  'note',
  'role',
  'sortString',
])

// Written by the library, so a custom property must not use them. Each value
// is a hint appended to the error message.
export const RESERVED_PROPERTY_NAMES: ReadonlyMap<string, string> = new Map([
  ['BEGIN', ''],
  ['END', ''],
  ['VERSION', ''],
  ['PRODID', ''],
  ['REV', '. Use addRevision() with a Date'],
])

// Updated automatically during the release action
export const LIB_VERSION = '1.0.0'

export const CONTENT_TYPE = 'text/vcard'
export const DEFAULT_CHARACTER_SET = 'utf-8'
export const DEFAULT_EXTENSION = 'vcf'
export const DEFAULT_FILENAME = 'vcard'
export const DEFAULT_MIME_TYPE = 'JPEG'
