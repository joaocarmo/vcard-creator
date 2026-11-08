import VCardException from './VCardException.js'
import {
  AddressOptions,
  CompanyOptions,
  CoordinateOptions,
  CustomPropertyOptions,
  DateString,
  DefinedElements,
  Element,
  EmailOptions,
  GeoOptions,
  ImppOptions,
  KeyOptions,
  LabelOptions,
  LogoOptions,
  NameOptions,
  PhoneOptions,
  PhotoOptions,
  Property,
  SetPropertyOptions,
  SocialOptions,
  StoredProperty,
  UrlOptions,
} from './types/VCard.js'
import {
  assertUri,
  escapeText,
  fold,
  formatFloat,
  isValidMimeType,
  quoteParamValue,
  resolveType,
  toImageSubtype,
} from './utils/functions.js'
import * as constants from './utils/constants.js'

export default class VCard {
  /**
   * Default Charset.
   *
   * @deprecated The output is always a UTF-8 string. Encode the file yourself
   * if you need another charset. Removed in the next major version.
   */
  public charset: string = constants.DEFAULT_CHARACTER_SET

  /**
   * Default ContentType.
   */
  private contentType: string = constants.CONTENT_TYPE

  /**
   * Default filename.
   */
  private filename: string = constants.DEFAULT_FILENAME

  /**
   * Default fileExtension.
   */
  private fileExtension: string = constants.DEFAULT_EXTENSION

  /**
   * Properties.
   */
  private properties: StoredProperty[] = []

  /**
   * Defined elements.
   */
  private definedElements: DefinedElements = {}

  /**
   * Multiple properties for element allowed.
   */
  private multiplePropertiesForElementAllowed: ReadonlySet<Element> =
    constants.ALLOWED_MULTIPLE_PROPERTIES

  /**
   * Add address.
   *
   * @link   https://tools.ietf.org/html/rfc2426#section-3.2.1
   */
  public addAddress({
    postOfficeBox = '',
    extended = '',
    street = '',
    locality = '',
    region = '',
    postalCode = '',
    country = '',
    type = ['intl', 'postal', 'parcel', 'work'],
  }: AddressOptions = {}): this {
    const value = [
      postOfficeBox,
      extended,
      street,
      locality,
      region,
      postalCode,
      country,
    ]
      .map(escapeText)
      .join(';')
    const resolved = resolveType(type)
    this.setProperty({
      element: 'address',
      key: `ADR${resolved !== '' ? `;${resolved}` : ''}`,
      value,
    })

    return this
  }

  /**
   * Add birthday.
   *
   * @link   https://tools.ietf.org/html/rfc2426#section-3.1.5
   * @param  date A Date object or a string in YYYY-MM-DD format
   * @example
   * vCard.addBirthday(new Date('1990-05-15'))
   * vCard.addBirthday('1990-05-15')
   */
  public addBirthday(date: Date | DateString): this {
    const value = date instanceof Date ? date.toISOString().slice(0, 10) : date
    this.setProperty({ element: 'birthday', key: 'BDAY', value })

    return this
  }

  /**
   * Add company.
   *
   * @link   https://tools.ietf.org/html/rfc2426#section-3.5.5
   */
  public addCompany({ name, department = '' }: CompanyOptions): this {
    const escapedName = escapeText(name)
    const escapedDept = department !== '' ? `;${escapeText(department)}` : ''
    this.setProperty({
      element: 'company',
      key: `ORG`,
      value: escapedName + escapedDept,
    })

    return this
  }

  /**
   * Add email.
   *
   * @link   https://tools.ietf.org/html/rfc2426#section-3.3.2
   */
  public addEmail({ address, type = [] }: EmailOptions): this {
    const resolved = resolveType(type)
    this.setProperty({
      element: 'email',
      key: `EMAIL${resolved !== '' ? `;${resolved}` : ''}`,
      value: address,
    })

    return this
  }

  /**
   * Add public key (base64-encoded or by URL).
   *
   * @link   https://tools.ietf.org/html/rfc2426#section-3.7.1
   * @throws VCardException
   */
  public addKey(options: KeyOptions): this {
    if ('url' in options) {
      assertUri(options.url)

      this.setProperty({
        element: 'key',
        key: 'KEY;VALUE=uri',
        value: options.url,
      })
    } else {
      const mime = options.mime ?? 'PGP'
      this.setProperty({
        element: 'key',
        key: `KEY;ENCODING=b;TYPE=${mime.toUpperCase()}`,
        value: options.key,
      })
    }

    return this
  }

  /**
   * Add jobtitle.
   *
   * @link   https://tools.ietf.org/html/rfc2426#section-3.5.1
   */
  public addJobtitle(jobtitle: string): this {
    this.setProperty({
      element: 'jobtitle',
      key: `TITLE`,
      value: escapeText(jobtitle),
    })

    return this
  }

  /**
   * Add role.
   *
   * @link   https://tools.ietf.org/html/rfc2426#section-3.5.2
   */
  public addRole(role: string): this {
    this.setProperty({
      element: 'role',
      key: `ROLE`,
      value: escapeText(role),
    })

    return this
  }

  /**
   * Add a photo or logo by URL.
   *
   * @throws VCardException
   */
  private addMediaUrl(property: string, url: string, element: Element): this {
    assertUri(url)

    this.setProperty({
      element,
      key: `${property};VALUE=uri`,
      value: url,
    })

    return this
  }

  /**
   * Add a photo or logo by base64 content.
   *
   * @throws VCardException
   */
  private addMediaContent(
    property: string,
    content: string,
    mime: string,
    element: Element,
  ): this {
    const subtype = toImageSubtype(mime)

    if (!isValidMimeType(subtype)) {
      throw new VCardException(`The MIME Media Type is invalid (${mime})`)
    }

    this.setProperty({
      element,
      key: `${property};ENCODING=b;TYPE=${subtype.toUpperCase()}`,
      value: content,
    })

    return this
  }

  /**
   * Add formatted name (FN) directly.
   *
   * When set, overrides the auto-generated FN from addName().
   * Useful for mononyms, company-as-contact, or custom formatting.
   *
   * @link   https://tools.ietf.org/html/rfc2426#section-3.1.1
   */
  public addFullName(fullName: string): this {
    this.setProperty({
      element: 'fullname',
      key: `FN`,
      value: escapeText(fullName),
    })

    return this
  }

  /**
   * Add name.
   *
   * @link   https://tools.ietf.org/html/rfc2426#section-3.1.2
   */
  public addName({
    familyName = '',
    givenName = '',
    additionalNames = '',
    honorificPrefix = '',
    honorificSuffix = '',
  }: NameOptions = {}): this {
    const values = [
      honorificPrefix,
      givenName,
      additionalNames,
      familyName,
      honorificSuffix,
    ].filter(Boolean)

    const property = [
      familyName,
      givenName,
      additionalNames,
      honorificPrefix,
      honorificSuffix,
    ]
      .map(escapeText)
      .join(';')
    this.setProperty({
      element: 'name',
      key: `N`,
      value: property,
    })

    const fnValue = escapeText(values.join(' ').trim())
    const hasFullName = this.properties.some(
      (property) => property.key === 'FN',
    )
    if (!hasFullName && fnValue !== '') {
      this.setProperty({
        element: 'fullname',
        key: `FN`,
        value: fnValue,
      })
    }

    return this
  }

  /**
   * Add nickname.
   *
   * @link   https://tools.ietf.org/html/rfc2426#section-3.1.3
   */
  public addNickname(nickname: string | string[]): this {
    const value = Array.isArray(nickname)
      ? nickname.map(escapeText).join(',').trim()
      : escapeText(nickname)
    this.setProperty({
      element: 'nickname',
      key: `NICKNAME`,
      value,
    })

    return this
  }

  /**
   * Add note.
   *
   * @link   https://tools.ietf.org/html/rfc2426#section-3.6.2
   */
  public addNote(note: string): this {
    this.setProperty({
      element: 'note',
      key: `NOTE`,
      value: escapeText(note),
    })

    return this
  }

  /**
   * Add categories.
   *
   * @link   https://tools.ietf.org/html/rfc2426#section-3.6.1
   */
  public addCategories(categories: string[]): this {
    this.setProperty({
      element: 'categories',
      key: `CATEGORIES`,
      value: categories.map(escapeText).join(',').trim(),
    })

    return this
  }

  /**
   * Add phone number.
   *
   * @link   https://tools.ietf.org/html/rfc2426#section-3.3.1
   */
  public addPhoneNumber({ number, type = [] }: PhoneOptions): this {
    const resolved = resolveType(type)
    this.setProperty({
      element: 'phoneNumber',
      key: `TEL${resolved !== '' ? `;${resolved}` : ''}`,
      value: `${number}`,
    })

    return this
  }

  /**
   * Add logo (base64-encoded or by URL).
   *
   * @link   https://tools.ietf.org/html/rfc2426#section-3.5.3
   * @throws VCardException
   */
  public addLogo(options: LogoOptions): this {
    if ('url' in options) {
      this.addMediaUrl('LOGO', options.url, 'logo')
    } else {
      this.addMediaContent(
        'LOGO',
        options.image,
        options.mime ?? constants.DEFAULT_MIME_TYPE,
        'logo',
      )
    }

    return this
  }

  /**
   * Add photo (base64-encoded or by URL).
   *
   * @link   https://tools.ietf.org/html/rfc2426#section-3.1.4
   * @throws VCardException
   */
  public addPhoto(options: PhotoOptions): this {
    if ('url' in options) {
      this.addMediaUrl('PHOTO', options.url, 'photo')
    } else {
      this.addMediaContent(
        'PHOTO',
        options.image,
        options.mime ?? constants.DEFAULT_MIME_TYPE,
        'photo',
      )
    }

    return this
  }

  /**
   * Add URL.
   *
   * @link   https://tools.ietf.org/html/rfc2426#section-3.6.8
   * @throws VCardException
   */
  public addUrl({ url, type = [] }: UrlOptions): this {
    assertUri(url)

    const resolved = resolveType(type)
    this.setProperty({
      element: 'url',
      key: `URL${resolved !== '' ? `;${resolved}` : ''}`,
      value: url,
    })

    return this
  }

  /**
   * Add social profile.
   * Emits both X-SOCIALPROFILE (iOS/macOS) and IMPP (RFC 4770) for cross-platform compatibility.
   *
   * @link   https://tools.ietf.org/html/rfc4770#section-1
   * @throws VCardException
   */
  public addSocial({ url, type, user = '' }: SocialOptions): this {
    // addImpp() checks too, but only after X-SOCIALPROFILE is stored
    assertUri(url)

    const socialUser = user !== '' ? `;x-user=${quoteParamValue(user)}` : ''
    const socialProfile = type !== '' ? `;type=${quoteParamValue(type)}` : ''

    this.setProperty({
      element: 'social',
      key: `X-SOCIALPROFILE${socialProfile}${socialUser}`,
      value: url,
    })

    this.addImpp({ uri: url, serviceType: type })

    return this
  }

  /**
   * Add IMPP (Instant Messaging and Presence Protocol) entry.
   *
   * @link   https://tools.ietf.org/html/rfc4770#section-1
   * @throws VCardException
   */
  public addImpp({ uri, serviceType = '' }: ImppOptions): this {
    assertUri(uri)

    const type =
      serviceType !== ''
        ? `;X-SERVICE-TYPE=${quoteParamValue(serviceType)}`
        : ''

    this.setProperty({
      element: 'impp',
      key: `IMPP${type}`,
      value: uri,
    })

    return this
  }

  /**
   * Add UID.
   *
   * @link   https://tools.ietf.org/html/rfc2426#section-3.6.7
   */
  public addUid(uid: string): this {
    this.setProperty({ element: 'uid', key: 'UID', value: uid })

    return this
  }

  /**
   * Add geographic position.
   *
   * @link   https://tools.ietf.org/html/rfc2426#section-3.4.2
   * @throws VCardException
   */
  public addGeo({ latitude, longitude }: GeoOptions): this {
    this.assertCoordinate({ name: 'latitude', value: latitude, limit: 90 })
    this.assertCoordinate({ name: 'longitude', value: longitude, limit: 180 })

    this.setProperty({
      element: 'geo',
      key: 'GEO',
      value: `${formatFloat(latitude)};${formatFloat(longitude)}`,
    })

    return this
  }

  /**
   * Check that a coordinate is a finite number from -limit to limit.
   *
   * @throws VCardException
   */
  private assertCoordinate({ name, value, limit }: CoordinateOptions): void {
    if (!Number.isFinite(value)) {
      // String() throws on objects without a usable toString()
      const shown =
        typeof value === 'object' && value !== null
          ? typeof value
          : String(value)
      throw new VCardException(
        `Invalid ${name}: ${shown}. Must be a finite number.`,
      )
    }

    if (value < -limit || value > limit) {
      throw new VCardException(
        `Invalid ${name}: ${value}. Must be between -${limit} and ${limit}.`,
      )
    }
  }

  /**
   * Add timezone.
   *
   * A UTC offset (`+HH:MM` or `-HH:MM`) is written as it is. Any other value,
   * such as an IANA name, is escaped and written with `VALUE=text`.
   * An offset's hours must be `00` to `23` and its minutes `00` to `59`.
   *
   * @link   https://tools.ietf.org/html/rfc2426#section-3.4.1
   * @throws VCardException
   */
  public addTimezone(timezone: string): this {
    const offset = /^[+-](\d{2}):(\d{2})$/.exec(timezone)
    const isUtcOffset = offset !== null

    if (isUtcOffset && (Number(offset[1]) > 23 || Number(offset[2]) > 59)) {
      throw new VCardException(
        `Invalid timezone offset: ${timezone}. Hours must be 00 to 23 and minutes 00 to 59.`,
      )
    }

    this.setProperty({
      element: 'timezone',
      key: isUtcOffset ? 'TZ' : 'TZ;VALUE=text',
      value: isUtcOffset ? timezone : escapeText(timezone),
    })

    return this
  }

  /**
   * Add sort string for name ordering (useful for CJK names).
   *
   * @link   https://tools.ietf.org/html/rfc2426#section-3.6.5
   */
  public addSortString(sortString: string): this {
    this.setProperty({
      element: 'sortString',
      key: `SORT-STRING`,
      value: escapeText(sortString),
    })

    return this
  }

  /**
   * Add revision timestamp.
   *
   * When set, overrides the auto-generated REV timestamp.
   *
   * @link   https://tools.ietf.org/html/rfc2426#section-3.6.4
   */
  public addRevision(date: Date): this {
    this.setProperty({
      element: 'revision',
      key: 'REV',
      value: date.toISOString(),
    })

    return this
  }

  /**
   * Add formatted address label.
   *
   * @link   https://tools.ietf.org/html/rfc2426#section-3.2.2
   */
  public addLabel({
    label,
    type = ['intl', 'postal', 'parcel', 'work'],
  }: LabelOptions): this {
    const resolved = resolveType(type)
    this.setProperty({
      element: 'label',
      key: `LABEL${resolved !== '' ? `;${resolved}` : ''}`,
      value: escapeText(label),
    })

    return this
  }

  /**
   * Add a custom property. Use this for non-standard X- properties
   * or any property not covered by the built-in methods.
   *
   * NOTE: Values are NOT automatically escaped. If your value contains
   * special characters (semicolons, commas, backslashes, newlines),
   * you are responsible for escaping them.
   *
   * @example
   * vCard.addCustomProperty({ name: 'X-PHONETIC-FIRST-NAME', value: 'Jon' })
   * vCard.addCustomProperty({ name: 'X-ANNIVERSARY', value: '2010-06-15' })
   * vCard.addCustomProperty({ name: 'X-CUSTOM', value: 'val', params: 'TYPE=work' })
   * vCard.addCustomProperty({ name: 'TEL', value: '+1-555', group: 'item1' })
   */
  public addCustomProperty({
    name,
    value,
    params = '',
    group,
  }: CustomPropertyOptions): this {
    this.setProperty({
      element: 'custom',
      key: `${name.toUpperCase()}${params !== '' ? `;${params}` : ''}`,
      value,
      group,
    })

    return this
  }

  /**
   * Build vCard (.vcf).
   *
   * @deprecated Use `toString()`. Removed in the next major version.
   */
  public buildVCard(): string {
    return this.toString()
  }

  private build(): string {
    const parts: string[] = [
      'BEGIN:VCARD\r\n',
      'VERSION:3.0\r\n',
      `PRODID:-//vcard-creator//vcard-creator ${constants.LIB_VERSION}//EN\r\n`,
    ]

    if (!this.definedElements['revision']) {
      parts.push(`REV:${new Date().toISOString()}\r\n`)
    }

    const charsetStr = this.charsetParam()
    for (const property of this.properties) {
      const prefix = property.group ? `${property.group}.` : ''
      const charset = constants.TEXT_ELEMENTS.has(property.element)
        ? charsetStr
        : ''
      parts.push(
        fold(`${prefix}${property.key}${charset}:${property.value}\r\n`),
      )
    }

    parts.push('END:VCARD\r\n')

    return parts.join('')
  }

  /**
   * Get output as string.
   */
  public toString(): string {
    return this.build()
  }

  /**
   * Combine multiple vCards into a single multi-contact string.
   *
   * Each vCard retains its own BEGIN/END markers. The result is a valid
   * multi-contact .vcf file.
   *
   * @param cards The vCards to combine
   */
  static concat(...cards: VCard[]): string {
    return VCard._concat(cards)
  }

  /**
   * Concatenate this vCard with others into a single multi-contact string.
   *
   * This card appears first, followed by the others in order.
   * Follows the same pattern as `Array.prototype.concat`.
   *
   * @param others Additional vCards to append
   */
  public concat(...others: VCard[]): string {
    return VCard._concat([this, ...others])
  }

  private static _concat(cards: VCard[]): string {
    return cards.map((card) => card.toString()).join('')
  }

  /**
   * Get charset.
   *
   * @deprecated The output is always a UTF-8 string. Encode the file yourself
   * if you need another charset. Removed in the next major version.
   */
  public getCharset(): string {
    return this.charset
  }

  /**
   * Get charset string.
   *
   * @deprecated The output is always a UTF-8 string. Removed in the next
   * major version.
   */
  public getCharsetString(): string {
    return this.charsetParam()
  }

  private charsetParam(): string {
    if (this.charset !== constants.DEFAULT_CHARACTER_SET) {
      return `;CHARSET=${this.charset}`
    }

    return ''
  }

  /**
   * Get content type.
   */
  public getContentType(): string {
    return this.contentType
  }

  /**
   * Get filename.
   *
   * @deprecated Choose the file name in your code. The library never saves
   * files. Removed in the next major version.
   */
  public getFilename(): string {
    return this.filename
  }

  /**
   * Get file extension.
   *
   * @deprecated Use the literal `'vcf'`. Removed in the next major version.
   */
  public getFileExtension(): string {
    return this.fileExtension
  }

  /**
   * Get properties.
   */
  public getProperties(): Property[] {
    return this.properties.map(({ key, value, group }) => ({
      key,
      value,
      group,
    }))
  }

  /**
   * Has property.
   *
   * @deprecated Use `getProperties().some((p) => p.key === key)` for the same
   * exact match. To match the property name only, compare
   * `p.key.split(';')[0]`. Removed in the next major version.
   */
  public hasProperty(key: string): boolean {
    return this.properties.some((property) => property.key === key)
  }

  /**
   * Set charset.
   *
   * @deprecated The output is always a UTF-8 string. Encode the file yourself
   * if you need another charset. Removed in the next major version.
   */
  public setCharset(charset: string): void {
    this.charset = charset
  }

  /**
   * Set filename.
   *
   * @deprecated Choose the file name in your code. The library never saves
   * files. Removed in the next major version.
   */
  public setFilename(value: string): void {
    if (!value) {
      return
    }

    this.filename = value
  }

  /**
   * Set property.
   *
   * @throws VCardException
   */
  private setProperty({
    element,
    key,
    value,
    group,
  }: SetPropertyOptions): void {
    if (
      !this.multiplePropertiesForElementAllowed.has(element) &&
      this.definedElements[element]
    ) {
      throw new VCardException(`This element already exists (${element})`)
    }

    this.definedElements[element] = true

    this.properties.push({
      element,
      key,
      value,
      group,
    })
  }
}
