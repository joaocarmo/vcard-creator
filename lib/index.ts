import VCard from './VCard.js'
import VCardException from './VCardException.js'
import type { Element as ElementType } from './types/VCard.js'

export { VCard, VCardException }
export default VCard

/**
 * @deprecated An internal key list. No public method takes or returns it.
 * Removed in the next major version.
 */
export type Element = ElementType

export type {
  AddressOptions,
  AddressType,
  CompanyOptions,
  CustomPropertyOptions,
  DateString,
  EmailOptions,
  EmailType,
  GeoOptions,
  ImppOptions,
  KeyOptions,
  LabelOptions,
  LogoOptions,
  NameOptions,
  PhoneOptions,
  PhoneType,
  PhotoOptions,
  Property,
  SocialOptions,
  UrlOptions,
  UrlType,
} from './types/VCard.js'
