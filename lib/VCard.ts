import VCardException from './VCardException.js'
import {
  ContentType,
  DefinedElements,
  Element,
  Format,
  Property,
} from './types/VCard.js'
import {
  b64encode,
  chunkSplit,
  escape,
  fold,
  isValidMimeType,
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
   * @param  {string} [name='']
   * @param  {string} [extended='']
   * @param  {string} [street='']
   * @param  {string} [city='']
   * @param  {string} [region='']
   * @param  {string} [zip='']
   * @param  {string} [country='']
   * @param  {string} [type='']
   * 'type' may be DOM | INTL | POSTAL | PARCEL | HOME | WORK
   * or any combination of these: e.g. 'WORK;PARCEL;POSTAL'
   * @return {this}
   */
  public addAddress(
    name: string = '',
    extended: string = '',
    street: string = '',
    city: string = '',
    region: string = '',
    zip: string = '',
    country: string = '',
    type: string = 'WORK;POSTAL',
  ): this {
    const value = `\
${name};${extended};${street};${city};${region};${zip};${country}\
`
    this.setProperty(
      'address',
      `ADR${type !== '' ? `;${type}` : ''}${this.getCharsetString()}`,
      value,
    )

    return this
  }

  /**
   * Add birthday.
   *
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
   * @param  {string} company
   * @param  {string} department
   * @return {this}
   */
  public addCompany(company: string, department: string = ''): this {
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
   * @param  {string} address The e-mail address
   * @param  {string} [type='']
   * The 'type' of the email address
   * type may be  PREF | WORK | HOME
   * or any combination of these: e.g. 'PREF;WORK'
   * @return {this}
   */
  public addEmail(address: string, type: string = ''): this {
    this.setProperty('email', `EMAIL${type !== '' ? `;${type}` : ''}`, address)

    return this
  }

  /**
   * Add jobtitle.
   *
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
   * @param  {string} [lastName='']
   * @param  {string} [firstName='']
   * @param  {string} [additional='']
   * @param  {string} [prefix='']
   * @param  {string} [suffix='']
   * @return {this}
   */
  public addName(
    lastName: string = '',
    firstName: string = '',
    additional: string = '',
    prefix: string = '',
    suffix: string = '',
  ): this {
    // Define values with non-empty values
    const values = [prefix, firstName, additional, lastName, suffix].filter(
      (m) => !!m,
    )

    const property = `\
${lastName};${firstName};${additional};${prefix};${suffix}\
`
    this.setProperty('name', `N${this.getCharsetString()}`, property)
    // Is property FN set?
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
   * Add note
   *
   * @param  {string} note
   * @return {this}
   */
  public addNote(note: string): this {
    this.setProperty('note', `NOTE${this.getCharsetString()}`, note)

    return this
  }

  /**
   * Add categories
   *
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
   * @param  {number | string} number
   * @param  {string} [type='']
   * 'type' may be PREF | WORK | HOME | VOICE | FAX | MSG |
   * CELL | PAGER | BBS | CAR | MODEM | ISDN | VIDEO
   * or any senseful combination, e.g. 'PREF;WORK;VOICE'
   * @return {this}
   */
  public addPhoneNumber(number: number | string, type: string = ''): this {
    this.setProperty(
      'phoneNumber',
      `TEL${type !== '' ? `;${type}` : ''}`,
      `${number}`,
    )

    return this
  }

  /**
   * Add Logo.
   *
   * @link   https://tools.ietf.org/html/rfc2426#section-3.5.3
   * @param  {string} url Image url or filename
   * @return {this}
   */
  public addLogoUrl(url: string): this {
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
   * @param  {string} image     Base64 encoded image content
   * @param  {string} [mime=''] Image content MIME type (defaults to 'JPEG')
   * @return {this}
   */
  public addLogo(
    image: string,
    mime: string = constants.DEFAULT_MIME_TYPE,
  ): this {
    this.addMediaContent('LOGO', image, mime, 'logo')

    return this
  }

  /**
   * Add Photo URL.
   *
   * @link   https://tools.ietf.org/html/rfc2426#section-3.1.4
   * @param  {string} url Image url or filename
   * @return {this}
   */
  public addPhotoUrl(url: string): this {
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
   * @param  {string} image     Base64 encoded image content
   * @param  {string} [mime=''] Image content MIME type (defaults to 'JPEG')
   * @return {this}
   */
  public addPhoto(
    image: string,
    mime: string = constants.DEFAULT_MIME_TYPE,
  ): this {
    this.addMediaContent('PHOTO', image, mime, 'photo')

    return this
  }

  /**
   * Add URL.
   *
   * @param  {string} url
   * @param  {string} [type=''] Type may be WORK | HOME
   * @return {this}
   */
  public addUrl(url: string, type: string = ''): this {
    this.setProperty('url', `URL${type !== '' ? `;${type}` : ''}`, url)

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
   *
   * @param {string} url  The URL to the user's profile.
   * @param {string} type The social media type (e.g., Twitter, LinkedIn, etc.)
   * @param {string} user The user's social media handle/username
   */
  public addSocial(url: string, type: string, user: string = ''): this {
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
   * @param {string} uri         The URI for the IM service (e.g., xmpp:user@example.com)
   * @param {string} serviceType The service type (e.g., XMPP, SIP, Skype)
   * @return {this}
   */
  public addImpp(uri: string, serviceType: string = ''): this {
    const type = serviceType !== '' ? `;X-SERVICE-TYPE=${serviceType}` : ''

    this.setProperty('impp', `IMPP${type}`, uri)

    return this
  }

  /**
   * Add UID.
   *
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
   * @param  {string} label The formatted address text
   * @param  {string} [type='WORK;POSTAL'] Address type
   * @return {this}
   */
  public addLabel(label: string, type: string = 'WORK;POSTAL'): this {
    this.setProperty(
      'label',
      `LABEL${type !== '' ? `;${type}` : ''}${this.getCharsetString()}`,
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
   * Get output as string.
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
   * Get output as string.
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
