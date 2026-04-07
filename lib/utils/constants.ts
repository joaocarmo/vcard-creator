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

// Updated automatically during the release action
export const LIB_VERSION = '0.11.0'

export const CONTENT_TYPE = 'text/vcard'
export const DEFAULT_CHARACTER_SET = 'utf-8'
export const DEFAULT_EXTENSION = 'vcf'
export const DEFAULT_FILENAME = 'vcard'
export const DEFAULT_MIME_TYPE = 'JPEG'
