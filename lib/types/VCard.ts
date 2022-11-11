export type MultipleElements =
  | 'address'
  | 'email'
  | 'phoneNumber'
  | 'social'
  | 'url'

export type ContentType = 'text/x-vcalendar' | 'text/x-vcard'

export type Element =
  | 'address'
  | 'birthday'
  | 'categories'
  | 'company'
  | 'email'
  | 'fullname'
  | 'jobtitle'
  | 'logo'
  | 'name'
  | 'note'
  | 'phoneNumber'
  | 'photo'
  | 'role'
  | 'social'
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
