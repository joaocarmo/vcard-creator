import { Property, DefinedElements } from './types/VCard'

export default class VCard {
  /**
   * Default Charset
   *
   * @var string
   */
  public charset = 'utf-8'

  /**
   * Default ContentType
   *
   * @var string
   */
  private contentType: 'text/x-vcard' | 'text/x-vcalendar' = 'text/x-vcard'

  /**
   * Default filename
   *
   * @var string
   */
  private filename = 'vcard'

  /**
   * Default fileExtension
   *
   * @var string
   */
  private fileExtension: 'vcf' | 'ics' = 'vcf'

  /**
   * Properties
   *
   * @var array
   */
  private properties: Property[] = []

  /**
   * definedElements
   *
   * @var object
   */
  private definedElements: DefinedElements = {}

  /**
   * Multiple properties for element allowed
   *
   * @var array
   */
  private multiplePropertiesForElementAllowed: string[] = [
    'email',
    'address',
    'phoneNumber',
    'url',
  ]

  /**
   * Defines the output format
   *
   * @var bool
   */
  private useVCalendar = false

  public constructor(format: 'vcard' | 'vcalendar' = 'vcard') {
    if (format === 'vcalendar') {
      this.setFormat(format)
    }
  }

  /**
   * Set format
   *
   * @param  string format Either 'vcard' or 'vcalendar'
   */
  public setFormat(format: 'vcard' | 'vcalendar' = 'vcard'): void {
    if (format === 'vcalendar') {
      this.contentType = 'text/x-vcalendar'
      this.fileExtension = 'ics'
      this.useVCalendar = true
    } else if (format === 'vcard') {
      this.contentType = 'text/x-vcard'
      this.fileExtension = 'vcf'
      this.useVCalendar = false
    }
  }

  /**
   * Add address
   *
   * @param  string [optional] name
   * @param  string [optional] extended
   * @param  string [optional] street
   * @param  string [optional] city
   * @param  string [optional] region
   * @param  string [optional] zip
   * @param  string [optional] country
   * @param  string [optional] type
   * type may be DOM | INTL | POSTAL | PARCEL | HOME | WORK
   * or any combination of these: e.g. 'WORK;PARCEL;POSTAL'
   * @return this
   */
  public addAddress(
    name = '',
    extended = '',
    street = '',
    city = '',
    region = '',
    zip = '',
    country = '',
    type = 'WORK;POSTAL',
  ): this {
    // init value
    const value = `\
${name};${extended};${street};${city};${region};${zip};${country}\
`
    // set property
    this.setProperty(
      'address',
      `ADR${(type !== '') ? `;${type}` : ''}${this.getCharsetString()}`,
      value,
    )

    return this
  }

  /**
   * Add birthday
   *
   * @param  string date Format is YYYY-MM-DD
   * @return this
   */
  public addBirthday(date: string): this {
    this.setProperty(
      'birthday',
      'BDAY',
      date,
    )

    return this
  }

  /**
   * Add company
   *
   * @param string company
   * @param string department
   * @return this
   */
  public addCompany(company: string, department = ''): this {
    this.setProperty(
      'company',
      `ORG${this.getCharsetString()}`,
      company
          + (department !== '' ? `;${department}` : ''),
    )

    return this
  }

  /**
   * Add email
   *
   * @param  string address The e-mail address
   * @param  string [optional] type
   * The type of the email address
   * type may be  PREF | WORK | HOME
   * or any combination of these: e.g. 'PREF;WORK'
   * @return this
   */
  public addEmail(address: string, type = ''): this {
    this.setProperty(
      'email',
      `EMAIL;INTERNET${(type !== '') ? `;${type}` : ''}`,
      address,
    )

    return this
  }

  /**
   * Add jobtitle
   *
   * @param  string jobtitle The jobtitle for the person.
   * @return this
   */
  public addJobtitle(jobtitle: string): this {
    this.setProperty(
      'jobtitle',
      `TITLE${this.getCharsetString()}`,
      jobtitle,
    )

    return this
  }

  /**
   * Add role
   *
   * @param  string role The role for the person.
   * @return this
   */
  public addRole(role: string): this {
    this.setProperty(
      'role',
      `ROLE${this.getCharsetString()}`,
      role,
    )

    return this
  }

  /**
   * Add a photo or logo (depending on property name)
   *
   * @param string property LOGO|PHOTO
   * @param string url image url or filename
   * @param bool   include Do we include the image in our vcard or not?
   * @param string element The name of the element to set
   * @throws VCardException
   * @return this
   */
  private addMedia(
    property: string,
    url: string,
    include = true,
    element: string,
  ): this {
    const value = ''
    this.setProperty(element, property, value)

    return this
  }

  /**
   * Add a photo or logo (depending on property name)
   *
   * @param string property LOGO|PHOTO
   * @param string content image content
   * @param string element The name of the element to set
   * @throws VCardException
   * @return this
   */
  private addMediaContent(
    property: string,
    content: string,
    element: string,
  ): this {
    const value = ''
    this.setProperty(element, property, value)

    return this
  }

  /**
   * Add name
   *
   * @param  string [optional] lastName
   * @param  string [optional] firstName
   * @param  string [optional] additional
   * @param  string [optional] prefix
   * @param  string [optional] suffix
   * @return this
   */
  public addName(
    lastName = '',
    firstName = '',
    additional = '',
    prefix = '',
    suffix = '',
  ): this {
    // define values with non-empty values
    const values = [
      prefix,
      firstName,
      additional,
      lastName,
      suffix,
    ].filter((m) => !!m)
    // set property
    const property = `\
${lastName};${firstName};${additional};${prefix};${suffix}\
`
    this.setProperty(
      'name',
      `N${this.getCharsetString()}`,
      property,
    )
    // is property FN set?
    if (!this.hasProperty('FN')) {
      // set property
      this.setProperty(
        'fullname',
        `FN${this.getCharsetString()}`,
        values.join(' ').trim(),
      )
    }

    return this
  }

  /**
   * Add note
   *
   * @param  string note
   * @return this
   */
  public addNote(note: string): this {
    this.setProperty(
      'note',
      `NOTE${this.getCharsetString()}`,
      note,
    )

    return this
  }

  /**
   * Add categories
   *
   * @param array categories
   * @return this
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
   * Add phone number
   *
   * @param  string number
   * @param  string [optional] type
   * Type may be PREF | WORK | HOME | VOICE | FAX | MSG |
   * CELL | PAGER | BBS | CAR | MODEM | ISDN | VIDEO
   * or any senseful combination, e.g. 'PREF;WORK;VOICE'
   * @return this
   */
  public addPhoneNumber(number: number, type = ''): this {
    this.setProperty(
      'phoneNumber',
      `TEL${(type !== '') ? `;${type}` : ''}`,
      `${number}`,
    )

    return this
  }

  /**
   * Add Logo
   *
   * @param  string url image url or filename
   * @param  bool include Include the image in the vcard?
   * @return this
   */
  public addLogo(url: string, include = true): this {
    this.addMedia(
      'LOGO',
      url,
      include,
      'logo',
    )

    return this
  }

  /**
  * Add Photo
  *
  * @param  string url image url or filename
  * @param  bool include Include the image in the vcard?
  * @return this
  */
  public addPhoto(url: string, include = true): this {
    this.addMedia(
      'PHOTO',
      url,
      include,
      'photo',
    )

    return this
  }

  /**
   * Add URL
   *
   * @param  string url
   * @param  string [optional] type Type may be WORK | HOME
   * @return this
   */
  public addURL(url: string, type = ''): this {
    this.setProperty(
      'url',
      `URL${(type !== '') ? `;${type}` : ''}`,
      url,
    )

    return this
  }

  /**
   * Build vCard (.vcf)
   *
   * @return string
   */
  private buildVCard(): string {
    // init date
    const now = new Date()

    // init string
    let string = ''
    string += 'BEGIN:VCARD\r\n'
    string += 'VERSION:3.0\r\n'
    string += `REV:${now.toISOString()}\r\n`

    // loop all properties
    const properties = this.getProperties()
    properties.forEach((property) => {
      string += this.fold(`${property.key}:${this.escape(property.value)}\r\n`)
    })

    string += 'END:VCARD\r\n'

    return string
  }

  /**
   * Build VCalender (.ics) - Safari (< iOS 8) can not open .vcf files, so we
   * have build a workaround.
   *
   * @return string
   */
  private buildVCalendar(): string {
    // init dates
    const nowISO = new Date().toISOString()
    const nowBase = nowISO.replace(/-/g, '').replace(/:/g, '').substring(0, 13)
    const dtstart = `${nowBase}00`
    const dtend = `${nowBase}01`

    // base64 it to be used as an attachemnt to the "calendar appointment"
    const b64vcard = this.b64encode(this.buildVCard())

    // chunk the single long line of b64 text in accordance with RFC2045
    // (and the exact line length determined from the original .ics file
    // exported from Apple calendar
    const b64mline = this.chunkSplit(b64vcard, 74, '\n')

    // need to indent all the lines by 1 space for the iPhone
    const b64final = b64mline.replace(/(.+)/g, ' $1')

    // init string
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
${b64final}
END:VEVENT
END:VCALENDAR
`

    return string
  }

  /**
   * Encodes data with MIME base64
   *
   * @param  data text
   * @return string
   */
  private b64encode(data: string): string {
    // for the browser
    const browserGlobal: Window = globalThis as unknown as Window
    if (typeof browserGlobal?.btoa === 'function') {
      return browserGlobal.btoa(data)
    }

    // for node.js
    const nodeGlobal: NodeJS.Global = globalThis as unknown as NodeJS.Global
    if (typeof nodeGlobal?.Buffer === 'function') {
      return nodeGlobal.Buffer.from(data).toString('base64')
    }

    return ''
  }

  /**
   * Split a string into smaller chunks
   * e.g., to match RFC 2045 semantics
   *
   * @link   https://tools.ietf.org/html/rfc2045
   * @param  body text
   * @return string
   */
  private chunkSplit(
    body: string,
    chunklen = 76,
    end = '\r\n',
  ): string {
    const chunklength = chunklen || 76
    const ending = end || '\r\n'

    if (chunklen < 1) {
      return ''
    }

    const chunks = body.match(
      new RegExp(`.{0,${chunklength}}`, 'g'),
    ) as string[]

    return chunks.join(ending)
  }

  /**
   * Fold a line according to RFC2425 section 5.8.1.
   *
   * @link   http://tools.ietf.org/html/rfc2425#section-5.8.1
   * @param  string text
   * @return string
   */
  private fold(text: string): string {
    if (text.length <= 75) {
      return text
    }

    // split, wrap and trim trailing separator
    const chunks = text.match(/.{1,73}/g) as string[]
    const wrapped = chunks.join('\r\n ').trim()

    return `${wrapped}\r\n`
  }

  /**
   * Escape newline characters according to RFC2425 section 5.8.4.
   *
   * @link   http://tools.ietf.org/html/rfc2425#section-5.8.4
   * @param  string text
   * @return string
   */
  private escape(text: string): string {
    let escapedText = (`${text}`).replace('\r\n', '\\n')
    escapedText = escapedText.replace('\n', '\\n')

    return escapedText
  }

  /**
   * Get output as string
   * @deprecated in the future
   *
   * @return string
   */
  public toString(): string {
    return this.getOutput()
  }

  /**
   * Get charset
   *
   * @return string
   */
  public getCharset(): string {
    return this.charset
  }

  /**
   * Get charset string
   *
   * @return string
   */
  public getCharsetString(): string {
    let charsetString = ''
    if (this.charset === 'utf-8') {
      charsetString = `;CHARSET=${this.charset}`
    }

    return charsetString
  }

  /**
   * Get content type
   *
   * @return string
   */
  public getContentType(): string {
    return this.contentType
  }

  /**
   * Get filename
   *
   * @return string
   */
  public getFilename(): string {
    return this.filename
  }

  /**
   * Get file extension
   *
   * @return string
   */
  public getFileExtension(): string {
    return this.fileExtension
  }

  /**
   * Get output as string
   * iOS devices (and safari < iOS 8 in particular)can not read .vcf (= vcard)
   * files. So there is a workaround to build a .ics (= vcalender) file.
   *
   * @return string
   */
  public getOutput(): string {
    return this.useVCalendar ? this.buildVCalendar() : this.buildVCard()
  }

  /**
   * Get properties
   *
   * @return array
   */
  public getProperties(): Property[] {
    return this.properties
  }

  /**
   * Has property
   *
   * @param  string key
   * @return bool
   */
  public hasProperty(key: string): boolean {
    const pproperties = this.getProperties()
    // eslint-disable-next-line consistent-return
    pproperties.forEach((property: Property) => {
      if (property.key === key && property.value !== '') {
        return true
      }
    })

    return false
  }

  /**
   * Set charset
   *
   * @param  string charset
   * @return void
   */
  public setCharset(charset: string): void {
    this.charset = charset
  }

  /**
   * Set filename
   *
   * @param  string $value
   * @return void
   */
  public setFilename(value: string): void {
    if (!value) {
      return
    }

    this.filename = value
  }

  /**
   * Set property
   *
   * @param  string element The element name you want to set,
   *                e.g.: name, email, phoneNumber, ...
   * @param  string key
   * @param  string value
   * @throws VCardException
   */
  public setProperty(element: string, key: string, value: string): void {
    if (this.multiplePropertiesForElementAllowed.indexOf(element) < 0
          && this.definedElements[element]
    ) {
      throw new Error(`This element already exists (${element})`)
    }
    // we define that we set this element
    this.definedElements[element] = true
    // adding property
    this.properties.push({
      key,
      value,
    })
  }
}
