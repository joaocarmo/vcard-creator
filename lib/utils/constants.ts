import { Element } from '../types/VCard.js'

export { MIME_TYPES } from './mime-types.js'

export const ALLOWED_MULTIPLE_PROPERTIES: ReadonlySet<Element> = new Set([
  'address',
  'calAdrUri',
  'calUri',
  'clientPidMap',
  'custom',
  'email',
  'fbUrl',
  'impp',
  'key',
  'label',
  'lang',
  'logo',
  'member',
  'nickname',
  'note',
  'phoneNumber',
  'photo',
  'related',
  'social',
  'source',
  'url',
  'xml',
])

export const TEXT_ELEMENTS: ReadonlySet<Element> = new Set([
  'address',
  'categories',
  'company',
  'fullname',
  'gender',
  'jobtitle',
  'kind',
  'label',
  'lang',
  'name',
  'nickname',
  'note',
  'related',
  'role',
  'sortString',
])

// Updated automatically during the release action
export const LIB_VERSION = '1.0.0'

export const CONTENT_TYPE = 'text/vcard'
export const DEFAULT_CHARACTER_SET = 'utf-8'
export const DEFAULT_EXTENSION = 'vcf'
export const DEFAULT_FILENAME = 'vcard'
export const DEFAULT_MIME_TYPE = 'JPEG'
