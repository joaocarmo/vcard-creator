import type { Element, PropertySpec } from '../types/VCard.js'

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
  },
  company: {
    ...single,
    name: 'ORG',
    valueType: 'text-structured',
    charset: true,
  },
  custom: { ...repeatable, name: '', valueType: 'raw-tab', label: 'Property' },
  email: { ...repeatable, name: 'EMAIL', valueType: 'raw', label: 'Email' },
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
  uid: { ...single, name: 'UID', valueType: 'raw', label: 'UID' },
  url: { ...repeatable, name: 'URL', valueType: 'uri' },
}
