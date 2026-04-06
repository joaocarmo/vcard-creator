import VCardException from './VCardException.js'
import {
  AddressOptions,
  CompanyOptions,
  CustomPropertyOptions,
  DateString,
  DefinedElements,
  Element,
  EmailOptions,
  ImppOptions,
  KeyOptions,
  LabelOptions,
  MediaOptions,
  MediaUrlOptions,
  NameOptions,
  PhoneOptions,
  Property,
  SetPropertyOptions,
  SocialOptions,
  UrlOptions,
} from './types/VCard.js'
import {
  escapeText,
  fold,
  isValidMimeType,
  resolveType,
} from './utils/functions.js'
import * as constants from './utils/constants.js'

export default class VCard {
  /**
   * Default Charset.
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
  private properties: Property[] = []

  /**
   * Defined elements.
   */
  private definedElements: DefinedElements = {}

  /**
   * Multiple properties for element allowed.
   */
  private multiplePropertiesForElementAllowed: Element[] =
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
    type = ['work', 'postal'],
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
      key: `ADR${resolved !== '' ? `;${resolved}` : ''}${this.getCharsetString()}`,
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
      key: `ORG${this.getCharsetString()}`,
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
   * Add public key (base64-encoded).
   *
   * @link   https://tools.ietf.org/html/rfc2426#section-3.7.1
   * @throws VCardException
   */
  public addKey({ key, mime = 'PGP' }: KeyOptions): this {
    this.setProperty({
      element: 'key',
      key: `KEY;ENCODING=b;TYPE=${mime.toUpperCase()}`,
      value: key,
    })

    return this
  }

  /**
   * Add public key by URL.
   *
   * @link   https://tools.ietf.org/html/rfc2426#section-3.7.1
   */
  public addKeyUrl({ url }: MediaUrlOptions): this {
    this.setProperty({
      element: 'key',
      key: 'KEY;VALUE=uri',
      value: url,
    })

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
      key: `TITLE${this.getCharsetString()}`,
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
      key: `ROLE${this.getCharsetString()}`,
      value: escapeText(role),
    })

    return this
  }

  /**
   * Add a photo or logo by URL.
   */
  private addMediaUrl(property: string, url: string, element: Element): this {
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
    if (!isValidMimeType(mime)) {
      throw new VCardException(`The MIME Media Type is invalid (${mime})`)
    }

    this.setProperty({
      element,
      key: `${property};ENCODING=b;TYPE=${mime.toUpperCase()}`,
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
      key: `FN${this.getCharsetString()}`,
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
      key: `N${this.getCharsetString()}`,
      value: property,
    })

    const fnValue = escapeText(values.join(' ').trim())
    if (!this.hasProperty('FN') && fnValue !== '') {
      this.setProperty({
        element: 'fullname',
        key: `FN${this.getCharsetString()}`,
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
      key: `NICKNAME${this.getCharsetString()}`,
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
      key: `NOTE${this.getCharsetString()}`,
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
      key: `CATEGORIES${this.getCharsetString()}`,
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
   * Add Logo URL.
   *
   * @link   https://tools.ietf.org/html/rfc2426#section-3.5.3
   */
  public addLogoUrl({ url }: MediaUrlOptions): this {
    this.addMediaUrl('LOGO', url, 'logo')

    return this
  }

  /**
   * Add Logo.
   *
   * @link   https://tools.ietf.org/html/rfc2426#section-3.5.3
   */
  public addLogo({
    image,
    mime = constants.DEFAULT_MIME_TYPE,
  }: MediaOptions): this {
    this.addMediaContent('LOGO', image, mime, 'logo')

    return this
  }

  /**
   * Add Photo URL.
   *
   * @link   https://tools.ietf.org/html/rfc2426#section-3.1.4
   */
  public addPhotoUrl({ url }: MediaUrlOptions): this {
    this.addMediaUrl('PHOTO', url, 'photo')

    return this
  }

  /**
   * Add Photo.
   *
   * @link   https://tools.ietf.org/html/rfc2426#section-3.1.4
   */
  public addPhoto({
    image,
    mime = constants.DEFAULT_MIME_TYPE,
  }: MediaOptions): this {
    this.addMediaContent('PHOTO', image, mime, 'photo')

    return this
  }

  /**
   * Add URL.
   *
   * @link   https://tools.ietf.org/html/rfc2426#section-3.6.8
   */
  public addUrl({ url, type = [] }: UrlOptions): this {
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
   */
  public addSocial({ url, type, user = '' }: SocialOptions): this {
    const socialUser = user !== '' ? `;x-user=${user}` : ''
    const socialProfile = type !== '' ? `;type=${type}` : ''

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
   */
  public addImpp({ uri, serviceType = '' }: ImppOptions): this {
    const type = serviceType !== '' ? `;X-SERVICE-TYPE=${serviceType}` : ''

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
  public addGeo(latitude: number, longitude: number): this {
    if (latitude < -90 || latitude > 90) {
      throw new VCardException(
        `Invalid latitude: ${latitude}. Must be between -90 and 90.`,
      )
    }

    if (longitude < -180 || longitude > 180) {
      throw new VCardException(
        `Invalid longitude: ${longitude}. Must be between -180 and 180.`,
      )
    }

    this.setProperty({
      element: 'geo',
      key: 'GEO',
      value: `${latitude};${longitude}`,
    })

    return this
  }

  /**
   * Add timezone.
   *
   * @link   https://tools.ietf.org/html/rfc2426#section-3.4.1
   */
  public addTimezone(timezone: string): this {
    this.setProperty({ element: 'timezone', key: 'TZ', value: timezone })

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
      key: `SORT-STRING${this.getCharsetString()}`,
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
  public addLabel({ label, type = ['work', 'postal'] }: LabelOptions): this {
    const resolved = resolveType(type)
    this.setProperty({
      element: 'label',
      key: `LABEL${resolved !== '' ? `;${resolved}` : ''}${this.getCharsetString()}`,
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
   */
  public buildVCard(): string {
    let string = ''
    string += 'BEGIN:VCARD\r\n'
    string += 'VERSION:3.0\r\n'
    string += `PRODID:-//vcard-creator//vcard-creator ${constants.LIB_VERSION}//EN\r\n`

    if (!this.definedElements['revision']) {
      string += `REV:${new Date().toISOString()}\r\n`
    }

    // Loop all properties
    const properties = this.getProperties()
    properties.forEach((property) => {
      const prefix = property.group ? `${property.group}.` : ''
      string += fold(`${prefix}${property.key}:${property.value}\r\n`)
    })

    string += 'END:VCARD\r\n'

    return string
  }

  /**
   * Get output as string.
   */
  public toString(): string {
    return this.buildVCard()
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
    return cards.map((card) => card.buildVCard()).join('')
  }

  /**
   * Get charset.
   */
  public getCharset(): string {
    return this.charset
  }

  /**
   * Get charset string.
   */
  public getCharsetString(): string {
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
   */
  public getFilename(): string {
    return this.filename
  }

  /**
   * Get file extension.
   */
  public getFileExtension(): string {
    return this.fileExtension
  }

  /**
   * Get properties.
   */
  public getProperties(): Property[] {
    return this.properties
  }

  /**
   * Has property.
   */
  public hasProperty(key: string): boolean {
    const properties = this.getProperties()

    return properties.some((property: Property) => property.key === key)
  }

  /**
   * Set charset.
   */
  public setCharset(charset: string): void {
    this.charset = charset
  }

  /**
   * Set filename.
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
  public setProperty({ element, key, value, group }: SetPropertyOptions): void {
    if (
      !this.multiplePropertiesForElementAllowed.includes(element) &&
      this.definedElements[element]
    ) {
      throw new VCardException(`This element already exists (${element})`)
    }

    this.definedElements[element] = true

    this.properties.push({
      key,
      value,
      group,
    })
  }
}
