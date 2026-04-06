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
  | 'revision'
  | 'role'
  | 'social'
  | 'sortString'
  | 'timezone'
  | 'uid'
  | 'url'

export type DefinedElements = {
  [key in Element]?: boolean
}

export interface Property {
  key: string
  value: string
  group?: string
}

export interface SetPropertyOptions {
  element: Element
  key: string
  value: string
  group?: string
}

export type DateString = `${number}-${number}-${number}`

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
  /** Given name (e.g., "John") */
  givenName?: string
  /** Family name (e.g., "Doe") */
  familyName?: string
  /** Additional/middle names */
  additionalNames?: string
  /** Honorific prefix (e.g., "Dr.", "Mr.") */
  honorificPrefix?: string
  /** Honorific suffix (e.g., "Jr.", "PhD") */
  honorificSuffix?: string
}

export interface AddressOptions {
  /** Post office box */
  postOfficeBox?: string
  /** Extended address (e.g., apartment, suite) */
  extended?: string
  /** Street address */
  street?: string
  /** City, town, village, or other locality */
  locality?: string
  /** State, province, or region */
  region?: string
  /** Postal code */
  postalCode?: string
  /** Country name */
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

export interface CustomPropertyOptions {
  /** Property name (automatically uppercased) */
  name: string
  /** Property value (NOT automatically escaped — caller is responsible for escaping) */
  value: string
  /** Optional parameters (e.g., 'TYPE=work') */
  params?: string
  /** Optional group prefix for property grouping (e.g., 'item1') */
  group?: string
}
