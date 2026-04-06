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

export type AddressType =
  | 'dom'
  | 'intl'
  | 'postal'
  | 'parcel'
  | 'home'
  | 'work'
  | 'pref'

export type PhoneType =
  | 'pref'
  | 'work'
  | 'home'
  | 'voice'
  | 'fax'
  | 'msg'
  | 'cell'
  | 'pager'
  | 'bbs'
  | 'car'
  | 'modem'
  | 'isdn'
  | 'video'

export type EmailType = 'pref' | 'work' | 'home'

export type UrlType = 'work' | 'home'

export interface NameOptions {
  lastName?: string
  firstName?: string
  additional?: string
  prefix?: string
  suffix?: string
}

export interface AddressOptions {
  name?: string
  extended?: string
  street?: string
  city?: string
  region?: string
  zip?: string
  country?: string
  type?: AddressType[]
}

export interface EmailOptions {
  address: string
  type?: EmailType[]
}

export interface PhoneOptions {
  number: number | string
  type?: PhoneType[]
}

export interface CompanyOptions {
  name: string
  department?: string
}

export interface UrlOptions {
  url: string
  type?: UrlType[]
}

export interface SocialOptions {
  url: string
  type: string
  user?: string
}

export interface ImppOptions {
  uri: string
  serviceType?: string
}

export interface MediaUrlOptions {
  url: string
}

export interface MediaOptions {
  image: string
  mime?: string
}

export interface LabelOptions {
  label: string
  type?: AddressType[]
}
