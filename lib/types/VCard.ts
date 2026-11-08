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
  | 'key'
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

export interface CoordinateOptions {
  name: string
  value: number
  limit: number
}

export interface ControlCharsOptions {
  value: string
  label: string
  allowTab?: boolean
}

export interface PropertyNameOptions {
  value: string
  label: string
}

export interface DateCheckOptions {
  date: unknown
  label: string
}

export interface StringCheckOptions {
  value: unknown
  label: string
}

export type DateString = `${number}-${number}-${number}`

export type AddressType =
  'dom' | 'intl' | 'postal' | 'parcel' | 'home' | 'work' | 'pref'

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

export type EmailType = 'internet' | 'pref' | 'work' | 'home'

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

export type PhotoOptions =
  | { url: string }
  | {
      /** Base64-encoded image data */ image: string
      /** Image MIME type, such as 'png', 'jpg' or 'image/png' (defaults to 'JPEG') */ mime?: string
    }

export type LogoOptions =
  | { url: string }
  | {
      /** Base64-encoded image data */ image: string
      /** Image MIME type, such as 'png', 'jpg' or 'image/png' (defaults to 'JPEG') */ mime?: string
    }

export type KeyOptions =
  | { url: string }
  | {
      /** Base64-encoded public key data */ key: string
      /** Key type (e.g., 'PGP', 'X509'). Defaults to 'PGP'. A value with `;`, `:` or `,` is quoted. A `"` or a control character other than tab throws */ mime?: string
    }

export interface GeoOptions {
  latitude: number
  longitude: number
}

export interface LabelOptions {
  label: string
  type?: AddressType[]
}

export interface StoredProperty extends Property {
  element: Element
}

export interface CustomPropertyOptions {
  /** Property name (automatically uppercased). Only letters, digits and `-` */
  name: string
  /** Property value (NOT automatically escaped: the caller is responsible for escaping). A control character other than tab throws */
  value: string
  /** Optional parameters (e.g., 'TYPE=work') */
  params?: string
  /** Optional group prefix for property grouping (e.g., 'item1'). Only letters, digits and `-` */
  group?: string
}
