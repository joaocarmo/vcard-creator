/** Supported vCard specification versions. */
export type VCardVersion = 3 | 4

/**
 * PREF parameter value (RFC 6350 §5.3).
 * An integer in the range 1–100 indicating preference; 1 = most preferred, 100 = least preferred.
 */
export type PrefValue = number

/** Options accepted by the VCard constructor. */
export interface VCardOptions {
  /**
   * vCard specification version to generate.
   * - `3` (default) — RFC 2426, full backwards compatibility
   * - `4`           — RFC 6350, opt-in; enables new properties and modern param encoding
   */
  version?: VCardVersion
  /**
   * When `true`, `add*()` methods emit RFC 6350 §3.3 group prefixes on properties
   * that carry a `group` option (e.g., `group1.EMAIL;TYPE=WORK:user@example.com`).
   * Default: `false` — `group` option silently ignored; zero output change for existing consumers.
   * Valid in both v3 and v4 mode.
   */
  useGroups?: boolean
}

export type Element =
  | 'address'
  | 'anniversary' // RFC 6350 §6.2.6
  | 'birthday'
  | 'calAdrUri' // RFC 6350 §6.9.2
  | 'calUri' // RFC 6350 §6.9.3
  | 'categories'
  | 'clientPidMap' // RFC 6350 §6.7.7
  | 'company'
  | 'custom'
  | 'email'
  | 'fbUrl' // RFC 6350 §6.9.1
  | 'fullname'
  | 'gender' // RFC 6350 §6.2.7
  | 'geo'
  | 'impp'
  | 'jobtitle'
  | 'key'
  | 'kind' // RFC 6350 §6.1.4
  | 'label'
  | 'lang' // RFC 6350 §6.4.4
  | 'logo'
  | 'member' // RFC 6350 §6.6.5
  | 'name'
  | 'nickname'
  | 'note'
  | 'phoneNumber'
  | 'photo'
  | 'related' // RFC 6350 §6.6.6
  | 'revision'
  | 'role'
  | 'social'
  | 'sortString'
  | 'source' // RFC 6350 §6.1.3
  | 'timezone'
  | 'uid'
  | 'url'
  | 'xml' // RFC 6350 §6.1.5

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
  /**
   * v4: SORT-AS parameter (RFC 6350 §5.9).
   * Specifies the string to use when sorting this property.
   * Ignored in vCard 3.0 mode.
   */
  sortAs?: string
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
  /**
   * v4: Free-text label for this address (RFC 6350 §6.3.1).
   * Emitted as `LABEL="…"` parameter on the ADR property. Ignored in vCard 3.0 mode.
   * Prefer this over the standalone `addLabel()` method in vCard 4.0.
   */
  label?: string
  /**
   * v4: Geo URI for this address (RFC 6350 §6.5 / ADR §5.10).
   * Example: `'geo:48.858,2.294'`
   */
  geo?: string
  /**
   * v4: Timezone for this address (RFC 6350 ADR §5.11).
   * Example: `'America/New_York'`
   */
  tz?: string
  /**
   * v4: ALTID parameter (RFC 6350 §5.4).
   * Groups alternative representations of the same address.
   */
  altid?: string
  /**
   * v4: PREF integer (RFC 6350 §5.3), 1 = most preferred to 100 = least preferred.
   * Ignored in vCard 3.0 mode.
   */
  pref?: number
  /**
   * v4: PID parameter (RFC 6350 §5.5).
   * Identifies a specific instance of this property.
   */
  pid?: string
  /**
   * RFC 6350 §3.3 group prefix identifier.
   * Only emitted when the VCard instance is constructed with `useGroups: true`.
   */
  group?: string
}

export interface EmailOptions {
  address: string
  type?: EmailType[]
  /**
   * v4: PREF integer (RFC 6350 §5.3), 1 = most preferred to 100 = least preferred.
   * Ignored in vCard 3.0 mode. Overridden by `TYPE=PREF` (emits `PREF=1`).
   */
  pref?: number
  /**
   * v4: ALTID parameter (RFC 6350 §5.4).
   * Groups alternative representations of the same email address.
   */
  altid?: string
  /**
   * v4: PID parameter (RFC 6350 §5.5).
   */
  pid?: string
  /**
   * RFC 6350 §3.3 group prefix identifier.
   * Only emitted when the VCard instance is constructed with `useGroups: true`.
   */
  group?: string
}

export interface PhoneOptions {
  number: number | string
  type?: PhoneType[]
  /**
   * v4: VALUE= parameter type (RFC 6350 §6.4.1).
   * Defaults to `'uri'` in vCard 4.0 mode (TEL SHOULD use URI format).
   * When `'uri'`, the number should use `tel:` URI format (e.g., `tel:+1-555-0100`).
   */
  value?: 'text' | 'uri'
  /**
   * v4: PREF integer (RFC 6350 §5.3), 1 = most preferred to 100 = least preferred.
   * Ignored in vCard 3.0 mode. Overridden by `TYPE=PREF` (emits `PREF=1`).
   */
  pref?: number
  /**
   * v4: ALTID parameter (RFC 6350 §5.4).
   */
  altid?: string
  /**
   * v4: PID parameter (RFC 6350 §5.5).
   */
  pid?: string
  /**
   * RFC 6350 §3.3 group prefix identifier.
   * Only emitted when the VCard instance is constructed with `useGroups: true`.
   */
  group?: string
}

export interface CompanyOptions {
  name: string
  department?: string
  /**
   * v4: SORT-AS parameter (RFC 6350 §5.9) on the ORG property.
   * Ignored in vCard 3.0 mode.
   */
  sortAs?: string
}

export interface UrlOptions {
  url: string
  type?: UrlType[]
  /**
   * v4: PREF integer (RFC 6350 §5.3), 1 = most preferred to 100 = least preferred.
   * Ignored in vCard 3.0 mode.
   */
  pref?: number
  /**
   * v4: ALTID parameter (RFC 6350 §5.4).
   */
  altid?: string
  /**
   * v4: PID parameter (RFC 6350 §5.5).
   */
  pid?: string
  /**
   * v4: MEDIATYPE parameter (RFC 6350 §5.7).
   * Example: `'text/html'`
   */
  mediaType?: string
  /**
   * RFC 6350 §3.3 group prefix identifier.
   * Only emitted when the VCard instance is constructed with `useGroups: true`.
   */
  group?: string
}

export interface SocialOptions {
  url: string
  type: string
  user?: string
}

export interface ImppOptions {
  uri: string
  serviceType?: string
  /**
   * v4: PREF integer (RFC 6350 §5.3), 1 = most preferred to 100 = least preferred.
   * Ignored in vCard 3.0 mode.
   */
  pref?: number
  /**
   * v4: PID parameter (RFC 6350 §5.5).
   */
  pid?: string
  /**
   * RFC 6350 §3.3 group prefix identifier.
   * Only emitted when the VCard instance is constructed with `useGroups: true`.
   */
  group?: string
}

export type PhotoOptions =
  | {
      url: string
      /** v4: MEDIATYPE parameter (RFC 6350 §5.7) */ mediaType?: string
    }
  | {
      /** Base64-encoded image data */ image: string
      /** Image MIME type (defaults to 'JPEG') */ mime?: string
      /**
       * ENCODING parameter value. Default `'b'` (RFC-standard per RFC 2426 §2.6.2).
       * Use `'BASE64'` for Apple Address Book / iOS Contacts compatibility (non-RFC extension).
       */
      encoding?: 'b' | 'BASE64'
    }

export type LogoOptions =
  | {
      url: string
      /** v4: MEDIATYPE parameter (RFC 6350 §5.7) */ mediaType?: string
    }
  | {
      /** Base64-encoded image data */ image: string
      /** Image MIME type (defaults to 'JPEG') */ mime?: string
      /**
       * ENCODING parameter value. Default `'b'` (RFC-standard per RFC 2426 §2.6.2).
       * Use `'BASE64'` for Apple Address Book / iOS Contacts compatibility (non-RFC extension).
       */
      encoding?: 'b' | 'BASE64'
    }

export type KeyOptions =
  | {
      url: string
      /** v4: MEDIATYPE parameter (RFC 6350 §5.7) */ mediaType?: string
    }
  | {
      /** Base64-encoded public key data */ key: string
      /** Key type (e.g., 'PGP', 'X509'). Defaults to 'PGP'. */ mime?: string
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
  /** Property name (automatically uppercased) */
  name: string
  /** Property value (NOT automatically escaped — caller is responsible for escaping) */
  value: string
  /** Optional parameters (e.g., 'TYPE=work') */
  params?: string
  /** Optional group prefix for property grouping (e.g., 'item1') */
  group?: string
}

// ─── vCard 4.0 (RFC 6350) types ─────────────────────────────────────────────

/**
 * vCard 4.0 KIND property values (RFC 6350 §6.1.4).
 * The documented literals (`'individual'`, `'group'`, `'org'`, `'location'`) are recommended;
 * any other string value is also permitted by the specification.
 */
export type KindType =
  | 'individual'
  | 'group'
  | 'org'
  | 'location'
  | (string & {})

/**
 * GENDER sex component values per RFC 6350 §6.2.7.
 * M = Male, F = Female, O = Other, N = None/Not applicable, U = Unknown.
 */
export type GenderSex = 'M' | 'F' | 'O' | 'N' | 'U'

/** Options for the GENDER property (RFC 6350 §6.2.7). */
export interface GenderOptions {
  /** Sex component (M/F/O/N/U per RFC 6350 §6.2.7) */
  sex?: GenderSex
  /** Free-text gender identity (appended after `;` if sex is present) */
  identity?: string
}

/**
 * RELATED property type values per RFC 6350 §6.6.6.
 */
export type RelatedType =
  | 'contact'
  | 'acquaintance'
  | 'friend'
  | 'met'
  | 'co-worker'
  | 'colleague'
  | 'co-resident'
  | 'neighbor'
  | 'child'
  | 'parent'
  | 'sibling'
  | 'spouse'
  | 'kin'
  | 'muse'
  | 'crush'
  | 'date'
  | 'sweetheart'
  | 'me'
  | 'agent'
  | 'emergency'

/** Options for the RELATED property (RFC 6350 §6.6.6). */
export interface RelatedOptions {
  /**
   * URI or text value identifying the related entity.
   * If the value looks like a URI (`http://`, `urn:`, etc.), VALUE=uri is emitted.
   */
  value: string
  /** Relationship type(s) between the entity and this vCard. */
  type?: RelatedType[]
}

/** Options for the LANG property (RFC 6350 §6.4.4). */
export interface LangOptions {
  /** BCP 47 language tag (e.g., `'en'`, `'fr-CA'`) */
  language: string
  /** Contexts in which this language is used */
  type?: ('work' | 'home')[]
  /** Preference (1 = highest priority, 100 = lowest) */
  pref?: number
}

/** Options for the ANNIVERSARY property (RFC 6350 §6.2.6). */
export interface AnniversaryOptions {
  /**
   * Anniversary date as a Date object or a date-and-or-time string.
   * In addition to `YYYY-MM-DD`, truncated forms like `--0203` (Feb 3, any year) are accepted.
   */
  date: Date | string
  /**
   * v4: CALSCALE parameter (RFC 6350 §5.8).
   * Example: `'gregorian'`
   */
  calscale?: string
}
