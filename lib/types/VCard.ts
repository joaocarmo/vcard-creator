export type MultipleElements =
  | 'address'
  | 'email'
  | 'impp'
  | 'phoneNumber'
  | 'social'
  | 'url'

export type ContentType = 'text/x-vcalendar' | 'text/x-vcard'

export type Element =
  | 'address'
  | 'birthday'
  | 'categories'
  | 'company'
  | 'custom'
  | 'email'
  | 'fullname'
  | 'geo'
  | 'impp'
  | 'jobtitle'
  | 'label'
  | 'logo'
  | 'name'
  | 'nickname'
  | 'note'
  | 'phoneNumber'
  | 'photo'
  | 'role'
  | 'social'
  | 'sortString'
  | 'timezone'
  | 'uid'
  | 'url'

export type Format = 'vcalendar' | 'vcard'

export type DefinedElements = {
  [key in Element]?: boolean
}

export interface Property {
  key: string
  value: string
}
