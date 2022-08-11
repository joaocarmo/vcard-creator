import { Element } from '../types/VCard'

export enum ContentTypes {
  VCALENDAR = 'text/x-vcalendar',
  VCARD = 'text/x-vcard',
}

export enum Formats {
  VCALENDAR = 'vcalendar',
  VCARD = 'vcard',
}

export const ALLOWED_MULTIPLE_PROPERTIES: Element[] = [
  'address',
  'email',
  'phoneNumber',
  'url',
]
export const DEFAULT_CHARACTER_SET = 'utf-8'
export const DEFAULT_CONTENT_TYPE = ContentTypes.VCARD
export const DEFAULT_EXTENSION = 'vcf'
export const DEFAULT_FILENAME = 'vcard'
export const DEFAULT_FORMAT = Formats.VCARD
