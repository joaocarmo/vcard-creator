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

export interface Property {
  key: string
  value: string
  group?: string
}

/**
 * @deprecated The type accepts values such as `'1990-5-15'`, which throw at
 * run time, and no method uses it. Use `string`. Removed in the next major
 * version.
 */
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
  /**
   * Phone number as a string, such as '+1-555-0100' or the E.164 form '+15550100'.
   * Passing a `number` is deprecated and removed in the next major version: it
   * loses leading zeros and the `+` sign, `1e21` is written as `1e+21`, and
   * integers above `Number.MAX_SAFE_INTEGER` change their last digits.
   */
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
  | { url: string; image?: never; mime?: never }
  | {
      /** Base64-encoded image data. Spaces, tabs, CR and LF are removed. Any other character outside the base64 alphabet throws */ image: string
      /** Image MIME type, such as 'png', 'jpg', 'image/png', 'image/png; charset=binary' or 'image/x-icon' (defaults to 'JPEG'). A value that is empty after whitespace and parameters are removed writes no TYPE */ mime?: string
      url?: never
    }

export type LogoOptions =
  | { url: string; image?: never; mime?: never }
  | {
      /** Base64-encoded image data. Spaces, tabs, CR and LF are removed. Any other character outside the base64 alphabet throws */ image: string
      /** Image MIME type, such as 'png', 'jpg', 'image/png', 'image/png; charset=binary' or 'image/x-icon' (defaults to 'JPEG'). A value that is empty after whitespace and parameters are removed writes no TYPE */ mime?: string
      url?: never
    }

export type KeyOptions =
  | { url: string; key?: never; text?: never; mime?: never }
  | {
      /** Key as text, such as an ASCII-armored PGP key. Escaped like other text values: line breaks are written as `\n` */ text: string
      /** Key type (e.g., 'PGP', 'X509'). Defaults to 'PGP'. Leading and trailing whitespace (space, tab, CR, LF) is removed. A value with `;`, `:` or `,` is quoted. A `"` or a control character other than tab inside the value throws */ mime?: string
      url?: never
      key?: never
    }
  | {
      /** Base64-encoded public key data. Spaces, tabs, CR and LF are removed. Any other character outside the base64 alphabet throws */ key: string
      /** Key type (e.g., 'PGP', 'X509'). Defaults to 'PGP'. Leading and trailing whitespace (space, tab, CR, LF) is removed. A value with `;`, `:` or `,` is quoted. A `"` or a control character other than tab inside the value throws */ mime?: string
      url?: never
      text?: never
    }

export interface GeoOptions {
  latitude: number
  longitude: number
}

export interface LabelOptions {
  label: string
  type?: AddressType[]
}

export interface CustomPropertyOptions {
  /** Property name (automatically uppercased). Only letters, digits and `-`. `BEGIN`, `END`, `VERSION`, `PRODID` and `REV` throw (the check ignores case) */
  name: string
  /** Property value (NOT automatically escaped: the caller is responsible for escaping). A control character other than tab throws */
  value: string
  /** Optional parameters (e.g., 'TYPE=work'): `name=value` pairs separated by `;`, values separated by `,`. A value with `;`, `:` or `,` must be in double quotes */
  params?: string
  /** Optional group prefix for property grouping (e.g., 'item1'). Only letters, digits and `-` */
  group?: string
}
