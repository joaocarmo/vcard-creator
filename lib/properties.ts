import type { Element, Property } from './types/VCard.js'

export type DefinedElements = {
  [key in Element]?: boolean
}

export type ValueType =
  | 'text'
  | 'text-structured'
  | 'text-list'
  | 'uri'
  | 'raw'
  | 'raw-tab'
  | 'binary'
  | 'date-or-date-time'
  | 'date-time'
  | 'utc-offset'
  | 'float-pair'

export interface PropertySpec {
  /** Property name. Empty for custom properties, whose caller gives it */
  name: string
  /** Default value type. Another type writes `VALUE=<type>` */
  valueType: ValueType
  multiple: boolean
  /** Whether the deprecated `CHARSET` parameter is written */
  charset: boolean
  /** Error label of the value */
  label?: string
}

export type ParamSpec =
  | {
      /** A type array, written as `TYPE=A,B` and left out when empty */
      kind: 'list'
      value: unknown
    }
  | {
      kind: 'single'
      name: string
      value: unknown
      upper?: boolean
    }

export interface PropertyInput {
  element: Element
  /** Defaults to the value type of the element */
  valueType?: ValueType
  value: unknown
  params?: ParamSpec[]
  /** Parameters written as they are, after a control-character check */
  rawParams?: unknown
  group?: string
  /** Defaults to the name of the element */
  name?: string
}

type MapProperties<T> = (value: T) => PropertyInput | PropertyInput[]

export type StorePropertiesOptions<T> =
  | { options: T; methodName: string; map: MapProperties<T> }
  | { value: T; methodName?: never; map: MapProperties<T> }

export interface StoredProperty extends Property {
  element: Element
}

const single = { multiple: false, charset: false }
const repeatable = { multiple: true, charset: false }

export const PROPERTIES: Readonly<Record<Element, PropertySpec>> = {
  address: {
    ...repeatable,
    name: 'ADR',
    valueType: 'text-structured',
    charset: true,
  },
  birthday: {
    ...single,
    name: 'BDAY',
    valueType: 'date-or-date-time',
    label: 'Birthday',
  },
  categories: {
    ...single,
    name: 'CATEGORIES',
    valueType: 'text-list',
    charset: true,
    label: 'Categories',
  },
  company: {
    ...single,
    name: 'ORG',
    valueType: 'text-structured',
    charset: true,
  },
  custom: { ...repeatable, name: '', valueType: 'raw-tab', label: 'Property' },
  email: { ...repeatable, name: 'EMAIL', valueType: 'text' },
  fullname: { ...single, name: 'FN', valueType: 'text', charset: true },
  geo: { ...single, name: 'GEO', valueType: 'float-pair' },
  impp: { ...repeatable, name: 'IMPP', valueType: 'uri' },
  jobtitle: { ...single, name: 'TITLE', valueType: 'text', charset: true },
  key: { ...repeatable, name: 'KEY', valueType: 'binary', label: 'Key' },
  label: { ...repeatable, name: 'LABEL', valueType: 'text', charset: true },
  logo: { ...repeatable, name: 'LOGO', valueType: 'binary', label: 'Image' },
  name: { ...single, name: 'N', valueType: 'text-structured', charset: true },
  nickname: {
    ...repeatable,
    name: 'NICKNAME',
    valueType: 'text',
    charset: true,
  },
  note: { ...repeatable, name: 'NOTE', valueType: 'text', charset: true },
  phoneNumber: {
    ...repeatable,
    name: 'TEL',
    valueType: 'raw',
    label: 'Phone number',
  },
  photo: { ...repeatable, name: 'PHOTO', valueType: 'binary', label: 'Image' },
  revision: {
    ...single,
    name: 'REV',
    valueType: 'date-time',
    label: 'Revision',
  },
  role: { ...single, name: 'ROLE', valueType: 'text', charset: true },
  social: { ...repeatable, name: 'X-SOCIALPROFILE', valueType: 'uri' },
  sortString: {
    ...single,
    name: 'SORT-STRING',
    valueType: 'text',
    charset: true,
  },
  timezone: {
    ...single,
    name: 'TZ',
    valueType: 'utc-offset',
    label: 'Timezone',
  },
  uid: { ...single, name: 'UID', valueType: 'text' },
  url: { ...repeatable, name: 'URL', valueType: 'uri' },
}

// Written by the library, so a custom property must not use them. Each value
// is a hint appended to the error message.
export const RESERVED_PROPERTY_NAMES: ReadonlyMap<string, string> = new Map([
  ['BEGIN', ''],
  ['END', ''],
  ['VERSION', ''],
  ['PRODID', ''],
  ['REV', '. Use addRevision() with a Date'],
])
