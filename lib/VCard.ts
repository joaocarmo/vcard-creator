import VCardException from './VCardException.js'
import {
  AddressOptions,
  AddressType,
  CompanyOptions,
  ContentType,
  DefinedElements,
  Element,
  EmailOptions,
  EmailType,
  Format,
  ImppOptions,
  LabelOptions,
  MediaOptions,
  MediaUrlOptions,
  NameOptions,
  PhoneOptions,
  PhoneType,
  Property,
  SocialOptions,
  UrlOptions,
  UrlType,
} from './types/VCard.js'
import {
  b64encode,
  chunkSplit,
  escape,
  fold,
  isOptions,
  isValidMimeType,
  resolveType,
} from './utils/functions.js'
import * as constants from './utils/constants.js'

export default class VCard {
  /**
   * Default Charset.
   *
   * @var string
   */
  public charset: string = constants.DEFAULT_CHARACTER_SET

  /**
   * Default ContentType.
   *
   * @var string
   */
  private contentType: ContentType = constants.DEFAULT_CONTENT_TYPE

  /**
   * Default filename.
   *
   * @var string
   */
  private filename: string = constants.DEFAULT_FILENAME

  /**
   * Default fileExtension.
   *
   * @var string
   */
  private fileExtension: string = constants.DEFAULT_EXTENSION

  /**
   * Properties.
   *
   * @var array
   */
  private properties: Property[] = []

  /**
   * Defined elements.
   *
   * @var object
   */
  private definedElements: DefinedElements = {}

  /**
   * Multiple properties for element allowed.
   *
   * @var array
   */
  private multiplePropertiesForElementAllowed: Element[] =
    constants.ALLOWED_MULTIPLE_PROPERTIES

  /**
   * Defines the output format.
   *
   * @var bool
   */
  private useVCalendar: boolean = false

  public constructor(format: Format = constants.DEFAULT_FORMAT) {
    if (format === constants.Formats.VCALENDAR) {
      this.setFormat(format)
    }
  }

  /**
   * Set format.
   *
   * @param  {Format} format Either 'vcard' or 'vcalendar'
   * @return {void}
   */
  public setFormat(format: Format = constants.DEFAULT_FORMAT): void {
    if (format === constants.Formats.VCALENDAR) {
      console.warn(
        `The format 'vcalendar' is deprecated and will be removed in the next major or minor release. Use 'vcard' instead.`,
      )
      this.contentType = constants.ContentTypes.VCALENDAR
      this.useVCalendar = true
    } else if (format === constants.Formats.VCARD) {
      this.contentType = constants.ContentTypes.VCARD
      this.useVCalendar = false
    }
  }

  /**
   * Add address.
   *
   * @link   https://tools.ietf.org/html/rfc2426#section-3.2.1
   */
  public addAddress(options: AddressOptions): this
  /** @deprecated Use object form instead: `addAddress({ street: '...', locality: '...', type: ['work'] })` */
  public addAddress(
    name?: string,
    extended?: string,
    street?: string,
    city?: string,
    region?: string,
    zip?: string,
    country?: string,
    type?: string,
  ): this
  public addAddress(
    nameOrOptions: string | AddressOptions = '',
    _extended: string = '',
    _street: string = '',
    _city: string = '',
    _region: string = '',
    _zip: string = '',
    _country: string = '',
    _type: AddressType[] | string = 'WORK;POSTAL',
  ): this {
    let postOfficeBox: string,
      extended: string,
      street: string,
      locality: string
    let region: string, postalCode: string, country: string
    let type: AddressType[] | string

    if (isOptions(nameOrOptions)) {
      const o = nameOrOptions
      postOfficeBox = o.postOfficeBox ?? ''
      extended = o.extended ?? ''
      street = o.street ?? ''
      locality = o.locality ?? ''
      region = o.region ?? ''
      postalCode = o.postalCode ?? ''
      country = o.country ?? ''
      type = o.type ?? ['work', 'postal']
    } else {
      postOfficeBox = nameOrOptions
      extended = _extended
      street = _street
      locality = _city
      region = _region
      postalCode = _zip
      country = _country
      type = _type
    }

    const value = `${postOfficeBox};${extended};${street};${locality};${region};${postalCode};${country}`
    const resolved = resolveType(type)
    this.setProperty(
      'address',
      `ADR${resolved !== '' ? `;${resolved}` : ''}${this.getCharsetString()}`,
      value,
    )

    return this
  }

  /**
   * Add birthday.
   *
   * @link   https://tools.ietf.org/html/rfc2426#section-3.1.5
   * @param  {string} date Format is YYYY-MM-DD
   * @return {this}
   */
  public addBirthday(date: string): this {
    this.setProperty('birthday', 'BDAY', date)

    return this
  }

  /**
   * Add company.
   *
   * @link   https://tools.ietf.org/html/rfc2426#section-3.5.5
   */
  public addCompany(options: CompanyOptions): this
  /** @deprecated Use object form instead: `addCompany({ name: 'Acme', department: 'Eng' })` */
  public addCompany(company: string, department?: string): this
  public addCompany(
    companyOrOptions: string | CompanyOptions,
    _department: string = '',
  ): this {
    let company: string
    let department: string

    if (isOptions(companyOrOptions)) {
      const o = companyOrOptions
      company = o.name
      department = o.department ?? ''
    } else {
      company = companyOrOptions
      department = _department
    }

    this.setProperty(
      'company',
      `ORG${this.getCharsetString()}`,
      company + (department !== '' ? `;${department}` : ''),
    )

    return this
  }

  /**
   * Add email.
   *
   * @link   https://tools.ietf.org/html/rfc2426#section-3.3.2
   */
  public addEmail(options: EmailOptions): this
  /** @deprecated Use object form instead: `addEmail({ address: 'j@x.com', type: ['work'] })` */
  public addEmail(address: string, type?: string): this
  public addEmail(
    addressOrOptions: string | EmailOptions,
    _type: EmailType[] | string = '',
  ): this {
    let address: string
    let type: EmailType[] | string

    if (isOptions(addressOrOptions)) {
      const o = addressOrOptions
      address = o.address
      type = o.type ?? ''
    } else {
      address = addressOrOptions
      type = _type
    }

    const resolved = resolveType(type)
    this.setProperty(
      'email',
      `EMAIL${resolved !== '' ? `;${resolved}` : ''}`,
      address,
    )

    return this
  }

  /**
   * Add jobtitle.
   *
   * @link   https://tools.ietf.org/html/rfc2426#section-3.5.1
   * @param  {string} jobtitle The jobtitle for the person
   * @return {this}
   */
  public addJobtitle(jobtitle: string): this {
    this.setProperty('jobtitle', `TITLE${this.getCharsetString()}`, jobtitle)

    return this
  }

  /**
   * Add role.
   *
   * @link   https://tools.ietf.org/html/rfc2426#section-3.5.2
   * @param  {string} role The role for the person
   * @return {this}
   */
  public addRole(role: string): this {
    this.setProperty('role', `ROLE${this.getCharsetString()}`, role)

    return this
  }

  /**
   * Add a photo or logo (depending on property name).
   *
   * @param  {string}  property 'LOGO' | 'PHOTO'
   * @param  {string}  url      Image url or filename
   * @param  {Element} element  The name of the element to set
   * @return {this}
   */
  private addMediaUrl(property: string, url: string, element: Element): this {
    this.setProperty(element, `${property};VALUE=uri`, url)

    return this
  }

  /**
   * Add a photo or logo (depending on property name).
   *
   * @param  {string}  property 'LOGO' | 'PHOTO'
   * @param  {string}  content  Image content
   * @param  {string}  mime     Image MIME type
   * @param  {Element} element  The name of the element to set
   * @throws VCardException
   * @return {this}
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

    this.setProperty(
      element,
      `${property};ENCODING=b;TYPE=${mime.toUpperCase()}`,
      content,
    )

    return this
  }

  /**
   * Add name.
   *
   * @link   https://tools.ietf.org/html/rfc2426#section-3.1.2
   */
  public addName(options: NameOptions): this
  /** @deprecated Use object form instead: `addName({ givenName: 'John', familyName: 'Doe' })` */
  public addName(
    lastName?: string,
    firstName?: string,
    additional?: string,
    prefix?: string,
    suffix?: string,
  ): this
  public addName(
    lastNameOrOptions: string | NameOptions = '',
    _firstName: string = '',
    _additional: string = '',
    _prefix: string = '',
    _suffix: string = '',
  ): this {
    let lastName: string, firstName: string, additional: string
    let prefix: string, suffix: string

    if (isOptions(lastNameOrOptions)) {
      const o = lastNameOrOptions
      lastName = o.familyName ?? ''
      firstName = o.givenName ?? ''
      additional = o.additionalNames ?? ''
      prefix = o.honorificPrefix ?? ''
      suffix = o.honorificSuffix ?? ''
    } else {
      lastName = lastNameOrOptions
      firstName = _firstName
      additional = _additional
      prefix = _prefix
      suffix = _suffix
    }

    const values = [prefix, firstName, additional, lastName, suffix].filter(
      (m) => !!m,
    )

    const property = `${lastName};${firstName};${additional};${prefix};${suffix}`
    this.setProperty('name', `N${this.getCharsetString()}`, property)
    if (!this.hasProperty('FN')) {
      this.setProperty(
        'fullname',
        `FN${this.getCharsetString()}`,
        values.join(' ').trim(),
      )
    }

    return this
  }

  /**
   * Add nickname.
   *
   * @link   https://tools.ietf.org/html/rfc2426#section-3.1.3
   * @param  {string|string[]} nickname
   */
  public addNickname(nickname: string | string[]): this {
    this.setProperty(
      'nickname',
      'NICKNAME',
      Array.isArray(nickname) ? nickname.join(',').trim() : nickname,
    )

    return this
  }

  /**
   * Add note.
   *
   * @link   https://tools.ietf.org/html/rfc2426#section-3.6.2
   * @param  {string} note
   * @return {this}
   */
  public addNote(note: string): this {
    this.setProperty('note', `NOTE${this.getCharsetString()}`, note)

    return this
  }

  /**
   * Add categories.
   *
   * @link   https://tools.ietf.org/html/rfc2426#section-3.6.1
   * @param  {Array<string>} categories
   * @return {this}
   */
  public addCategories(categories: string[]): this {
    this.setProperty(
      'categories',
      `CATEGORIES${this.getCharsetString()}`,
      categories.join(',').trim(),
    )

    return this
  }

  /**
   * Add phone number.
   *
   * @link   https://tools.ietf.org/html/rfc2426#section-3.3.1
   */
  public addPhoneNumber(options: PhoneOptions): this
  /** @deprecated Use object form instead: `addPhoneNumber({ number: '+1555', type: ['cell'] })` */
  public addPhoneNumber(number: number | string, type?: string): this
  public addPhoneNumber(
    numberOrOptions: number | string | PhoneOptions,
    _type: PhoneType[] | string = '',
  ): this {
    let num: number | string
    let type: PhoneType[] | string

    if (isOptions(numberOrOptions)) {
      const o = numberOrOptions
      num = o.number
      type = o.type ?? ''
    } else {
      num = numberOrOptions
      type = _type
    }

    const resolved = resolveType(type)
    this.setProperty(
      'phoneNumber',
      `TEL${resolved !== '' ? `;${resolved}` : ''}`,
      `${num}`,
    )

    return this
  }

  /**
   * Add Logo URL.
   *
   * @link   https://tools.ietf.org/html/rfc2426#section-3.5.3
   */
  public addLogoUrl(options: MediaUrlOptions): this
  /** @deprecated Use object form instead: `addLogoUrl({ url: '...' })` */
  public addLogoUrl(url: string): this
  public addLogoUrl(urlOrOptions: string | MediaUrlOptions): this {
    const url = isOptions(urlOrOptions) ? urlOrOptions.url : urlOrOptions
    this.addMediaUrl('LOGO', url, 'logo')

    return this
  }

  /**
   * @deprecated Use `addLogoUrl` instead.
   */
  public addLogoURL(url: string): this {
    return this.addLogoUrl(url)
  }

  /**
   * Add Logo.
   *
   * @link   https://tools.ietf.org/html/rfc2426#section-3.5.3
   */
  public addLogo(options: MediaOptions): this
  /** @deprecated Use object form instead: `addLogo({ image: '...', mime: 'JPEG' })` */
  public addLogo(image: string, mime?: string): this
  public addLogo(
    imageOrOptions: string | MediaOptions,
    _mime: string = constants.DEFAULT_MIME_TYPE,
  ): this {
    let image: string
    let mime: string

    if (isOptions(imageOrOptions)) {
      const o = imageOrOptions
      image = o.image
      mime = o.mime ?? constants.DEFAULT_MIME_TYPE
    } else {
      image = imageOrOptions
      mime = _mime
    }

    this.addMediaContent('LOGO', image, mime, 'logo')

    return this
  }

  /**
   * Add Photo URL.
   *
   * @link   https://tools.ietf.org/html/rfc2426#section-3.1.4
   */
  public addPhotoUrl(options: MediaUrlOptions): this
  /** @deprecated Use object form instead: `addPhotoUrl({ url: '...' })` */
  public addPhotoUrl(url: string): this
  public addPhotoUrl(urlOrOptions: string | MediaUrlOptions): this {
    const url = isOptions(urlOrOptions) ? urlOrOptions.url : urlOrOptions
    this.addMediaUrl('PHOTO', url, 'photo')

    return this
  }

  /**
   * @deprecated Use `addPhotoUrl` instead.
   */
  public addPhotoURL(url: string): this {
    return this.addPhotoUrl(url)
  }

  /**
   * Add Photo.
   *
   * @link   https://tools.ietf.org/html/rfc2426#section-3.1.4
   */
  public addPhoto(options: MediaOptions): this
  /** @deprecated Use object form instead: `addPhoto({ image: '...', mime: 'JPEG' })` */
  public addPhoto(image: string, mime?: string): this
  public addPhoto(
    imageOrOptions: string | MediaOptions,
    _mime: string = constants.DEFAULT_MIME_TYPE,
  ): this {
    let image: string
    let mime: string

    if (isOptions(imageOrOptions)) {
      const o = imageOrOptions
      image = o.image
      mime = o.mime ?? constants.DEFAULT_MIME_TYPE
    } else {
      image = imageOrOptions
      mime = _mime
    }

    this.addMediaContent('PHOTO', image, mime, 'photo')

    return this
  }

  /**
   * Add URL.
   *
   * @link   https://tools.ietf.org/html/rfc2426#section-3.6.8
   */
  public addUrl(options: UrlOptions): this
  /** @deprecated Use object form instead: `addUrl({ url: '...', type: ['work'] })` */
  public addUrl(url: string, type?: string): this
  public addUrl(
    urlOrOptions: string | UrlOptions,
    _type: UrlType[] | string = '',
  ): this {
    let url: string
    let type: UrlType[] | string

    if (isOptions(urlOrOptions)) {
      const o = urlOrOptions
      url = o.url
      type = o.type ?? ''
    } else {
      url = urlOrOptions
      type = _type
    }

    const resolved = resolveType(type)
    this.setProperty('url', `URL${resolved !== '' ? `;${resolved}` : ''}`, url)

    return this
  }

  /**
   * @deprecated Use `addUrl` instead.
   */
  public addURL(url: string, type: string = ''): this {
    return this.addUrl(url, type)
  }

  /**
   * Add social profile.
   * Emits both X-SOCIALPROFILE (iOS/macOS) and IMPP (RFC 4770) for cross-platform compatibility.
   *
   * @link   https://tools.ietf.org/html/rfc4770#section-1
   */
  public addSocial(options: SocialOptions): this
  /** @deprecated Use object form instead: `addSocial({ url: '...', type: 'X', user: 'handle' })` */
  public addSocial(url: string, type: string, user?: string): this
  public addSocial(
    urlOrOptions: string | SocialOptions,
    _type: string = '',
    _user: string = '',
  ): this {
    let url: string
    let type: string
    let user: string

    if (isOptions(urlOrOptions)) {
      const o = urlOrOptions
      url = o.url
      type = o.type
      user = o.user ?? ''
    } else {
      url = urlOrOptions
      type = _type
      user = _user
    }

    const socialUser = user !== '' ? `;x-user=${user}` : ''
    const socialProfile = type !== '' ? `;type=${type}` : ''

    this.setProperty(
      'social',
      `X-SOCIALPROFILE${socialProfile}${socialUser}`,
      url,
    )

    this.addImpp(url, type)

    return this
  }

  /**
   * Add IMPP (Instant Messaging and Presence Protocol) entry.
   *
   * @link   https://tools.ietf.org/html/rfc4770#section-1
   */
  public addImpp(options: ImppOptions): this
  /** @deprecated Use object form instead: `addImpp({ uri: 'xmpp:user@example.com', serviceType: 'XMPP' })` */
  public addImpp(uri: string, serviceType?: string): this
  public addImpp(
    uriOrOptions: string | ImppOptions,
    _serviceType: string = '',
  ): this {
    let uri: string
    let serviceType: string

    if (isOptions(uriOrOptions)) {
      const o = uriOrOptions
      uri = o.uri
      serviceType = o.serviceType ?? ''
    } else {
      uri = uriOrOptions
      serviceType = _serviceType
    }

    const type = serviceType !== '' ? `;X-SERVICE-TYPE=${serviceType}` : ''

    this.setProperty('impp', `IMPP${type}`, uri)

    return this
  }

  /**
   * Add UID.
   *
   * @link   https://tools.ietf.org/html/rfc2426#section-3.6.7
   * @param  {string} uid
   * @return {this}
   */
  public addUid(uid: string): this {
    this.setProperty('uid', 'UID', uid)

    return this
  }

  /**
   * @deprecated Use `addUid` instead.
   */
  public addUID(uid: string): this {
    return this.addUid(uid)
  }

  /**
   * Add geographic position.
   *
   * @link   https://tools.ietf.org/html/rfc2426#section-3.4.2
   * @param  {number} latitude  Latitude in decimal degrees (-90 to 90)
   * @param  {number} longitude Longitude in decimal degrees (-180 to 180)
   * @throws {VCardException}
   * @return {this}
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

    this.setProperty('geo', 'GEO', `${latitude};${longitude}`)

    return this
  }

  /**
   * Add timezone.
   *
   * @link   https://tools.ietf.org/html/rfc2426#section-3.4.1
   * @param  {string} timezone UTC offset (e.g., '-05:00') or IANA name (e.g., 'America/New_York')
   * @return {this}
   */
  public addTimezone(timezone: string): this {
    this.setProperty('timezone', 'TZ', timezone)

    return this
  }

  /**
   * Add sort string for name ordering (useful for CJK names).
   *
   * @link   https://tools.ietf.org/html/rfc2426#section-3.6.5
   * @param  {string} sortString The string to use for sorting
   * @return {this}
   */
  public addSortString(sortString: string): this {
    this.setProperty('sortString', 'SORT-STRING', sortString)

    return this
  }

  /**
   * Add formatted address label.
   *
   * @link   https://tools.ietf.org/html/rfc2426#section-3.2.2
   */
  public addLabel(options: LabelOptions): this
  /** @deprecated Use object form instead: `addLabel({ label: '...', type: ['work', 'postal'] })` */
  public addLabel(label: string, type?: string): this
  public addLabel(
    labelOrOptions: string | LabelOptions,
    _type: AddressType[] | string = 'WORK;POSTAL',
  ): this {
    let label: string
    let type: AddressType[] | string

    if (isOptions(labelOrOptions)) {
      const o = labelOrOptions
      label = o.label
      type = o.type ?? ['work', 'postal']
    } else {
      label = labelOrOptions
      type = _type
    }

    const resolved = resolveType(type)
    this.setProperty(
      'label',
      `LABEL${resolved !== '' ? `;${resolved}` : ''}${this.getCharsetString()}`,
      label,
    )

    return this
  }

  /**
   * Add a custom property. Use this for non-standard X- properties
   * or any property not covered by the built-in methods.
   *
   * @example
   * vCard.addCustomProperty('X-PHONETIC-FIRST-NAME', 'Jon')
   * vCard.addCustomProperty('X-ANNIVERSARY', '2010-06-15')
   * vCard.addCustomProperty('X-CUSTOM', 'value', 'TYPE=work')
   *
   * @param  {string} name   Property name (automatically uppercased)
   * @param  {string} value  Property value
   * @param  {string} [params=''] Optional parameters (e.g., 'TYPE=work')
   * @return {this}
   */
  public addCustomProperty(
    name: string,
    value: string,
    params: string = '',
  ): this {
    this.setProperty(
      'custom',
      `${name.toUpperCase()}${params !== '' ? `;${params}` : ''}`,
      value,
    )

    return this
  }

  /**
   * Build vCard (.vcf).
   *
   * @return {string}
   */
  public buildVCard(): string {
    const now = new Date()

    let string = ''
    string += 'BEGIN:VCARD\r\n'
    string += 'VERSION:3.0\r\n'
    string += `PRODID:-//vcard-creator//vcard-creator ${constants.LIB_VERSION}//EN\r\n`
    string += `REV:${now.toISOString()}\r\n`

    // Loop all properties
    const properties = this.getProperties()
    properties.forEach((property) => {
      string += fold(`${property.key}:${escape(property.value)}\r\n`)
    })

    string += 'END:VCARD\r\n'

    return string
  }

  /**
   * Build VCalender (.ics) - Safari (< iOS 7) can not open .vcf files, so we
   * built a workaround.
   *
   * @deprecated This method is deprecated and will be removed in the next major
   * or minor release. Use `buildVCard` instead. For more information, see
   * https://stackoverflow.com/a/11405271/8713532.
   * @return {string}
   */
  public buildVCalendar(): string {
    console.warn(
      `The method 'buildVCalendar' is deprecated and will be removed in the next major or minor release. Use 'buildVCard' instead.`,
    )

    const nowISO = new Date().toISOString()
    const nowBase = nowISO.replace(/-/g, '').replace(/:/g, '').substring(0, 13)
    const dtstart = `${nowBase}00`
    const dtend = `${nowBase}01`

    // Base 64 it to be used as an attachemnt to the 'calendar' appointment
    const b64vcard = b64encode(this.buildVCard())

    /*
     * Chunk the single long line of b64 text in accordance with RFC2045
     * (and the exact line length determined from the original .ics file
     * exported from Apple calendar
     */
    const b64mline = chunkSplit(b64vcard, 74, '\n')

    // Need to indent all the lines by 1 space for the iPhone
    const b64final = b64mline.replace(/(.+)/g, ' $1')

    const string = `\
BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
DTSTART;TZID=Europe/London:${dtstart}
DTEND;TZID=Europe/London:${dtend}
SUMMARY:Click the attachment to save to your contacts
DTSTAMP:${dtstart}Z
ATTACH;VALUE=BINARY;ENCODING=BASE64;FMTTYPE=text/directory;
 X-APPLE-FILENAME=${this.getFilename()}.${this.getFileExtension()}:
${b64final}\
END:VEVENT
END:VCALENDAR
`

    return string
  }

  /**
   * Get output.
   *
   * @return {string}
   */
  public toString(): string {
    return this.getOutput()
  }

  /**
   * Get charset.
   *
   * @return {string}
   */
  public getCharset(): string {
    return this.charset
  }

  /**
   * Get charset string.
   *
   * @return {string}
   */
  public getCharsetString(): string {
    let charsetString = ''

    if (this.charset === constants.DEFAULT_CHARACTER_SET) {
      charsetString = `;CHARSET=${this.charset}`
    }

    return charsetString
  }

  /**
   * Get content type.
   *
   * @return {string}
   */
  public getContentType(): string {
    return this.contentType
  }

  /**
   * Get filename.
   *
   * @return {string}
   */
  public getFilename(): string {
    return this.filename
  }

  /**
   * Get file extension.
   *
   * @return {string}
   */
  public getFileExtension(): string {
    return this.fileExtension
  }

  /**
   * Get output.
   *
   * iOS devices (and safari < iOS 8 in particular)can not read .vcf (= vcard)
   * files. So there is a workaround to build a .ics (= vcalender) file.
   *
   * @return {string}
   */
  public getOutput(): string {
    return this.useVCalendar ? this.buildVCalendar() : this.buildVCard()
  }

  /**
   * Get properties.
   *
   * @return {Array<{key: string, value: string}>}
   */
  public getProperties(): Property[] {
    return this.properties
  }

  /**
   * Has property.
   *
   * @param  {string} key
   * @return {boolean}
   */
  public hasProperty(key: string): boolean {
    const properties = this.getProperties()

    return properties.some(
      (property: Property) => property.key === key && property.value !== '',
    )
  }

  /**
   * Set charset.
   *
   * @param  {string} charset
   * @return {void}
   */
  public setCharset(charset: string): void {
    this.charset = charset
  }

  /**
   * Set filename.
   *
   * @param  {string} value
   * @return {void}
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
   * @param  {Element} element The element name you want to set,
   *                           e.g.: name, email, phoneNumber, ...
   * @param  {string}  key
   * @param  {string}  value
   * @throws {VCardException}
   * @return {void}
   */
  public setProperty(element: Element, key: string, value: string): void {
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
    })
  }
}
