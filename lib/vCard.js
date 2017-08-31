var { transliterate } = require('transliteration')

class vCard {
  constructor() {
    /**
     * definedElements
     *
     * @var array
     */
    this.definedElements = []
    /**
     * Multiple properties for element allowed
     *
     * @var array
     */
    this.multiplePropertiesForElementAllowed = [
      'email',
      'address',
      'phoneNumber',
      'url'
    ]
    /**
     * Properties
     *
     * @var array
     */
    this.properties = []
    /**
     * Default Charset
     *
     * @var string
     */
    this.charset = 'utf-8'
    /**
     * Default ContentType
     *
     * @var string
     */
    this.contentType = 'text/x-vcard'
    /**
     * Default fileExtension
     *
     * @var string
     */
    this.fileExtension = 'vcf'
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
  addAddress(
      name = '',
      extended = '',
      street = '',
      city = '',
      region = '',
      zip = '',
      country = '',
      type = 'WORK;POSTAL'
  ) {
      // init value
      var value = name + ';' + extended + ';' + street + ';' + city + ';' + region + ';' + zip + ';' + country
      // set property
      this.setProperty(
          'address',
          'ADR' + ((type != '') ? ';' + type : '') + this.getCharsetString(),
          value
      )
      return this
  }

  /**
   * Add birthday
   *
   * @param  string date Format is YYYY-MM-DD
   * @return this
   */
  addBirthday(date)
  {
      this.setProperty(
          'birthday',
          'BDAY',
          date
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
  addCompany(company, department = '')
  {
      this.setProperty(
          'company',
          'ORG' + this.getCharsetString(),
          company
          + (department != '' ? ';' + department : '')
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
  addEmail(address, type = '')
  {
      this.setProperty(
          'email',
          'EMAIL;INTERNET' + ((type != '') ? ';' + type : ''),
          address
      )
      return this
  }

  /**
   * Add jobtitle
   *
   * @param  string jobtitle The jobtitle for the person.
   * @return this
   */
  addJobtitle(jobtitle)
  {
      this.setProperty(
          'jobtitle',
          'TITLE' + this.getCharsetString(),
          jobtitle
      )
      return this
  }

  /**
   * Add role
   *
   * @param  string role The role for the person.
   * @return this
   */
  addRole(role)
  {
      this.setProperty(
          'role',
          'ROLE' + this.getCharsetString(),
          role
      )
      return this
  }

  /**
   * Add a photo or logo (depending on property name)
   *
   * @param string property LOGO|PHOTO
   * @param string url image url or filename
   * @param bool include Do we include the image in our vcard or not?
   * @param string element The name of the element to set
   */
  addMedia(property, url, include = true, element)
  {
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
  addName(
      lastName = '',
      firstName = '',
      additional = '',
      prefix = '',
      suffix = ''
  ) {
      // define values with non-empty values
      var values = [
          prefix,
          firstName,
          additional,
          lastName,
          suffix,
      ].filter(m => !!m)
      // set property
      var property = lastName + ';' + firstName + ';' + additional + ';' + prefix + ';' + suffix
      this.setProperty(
          'name',
          'N' + this.getCharsetString(),
          property
      )
      // is property FN set?
      if (!this.hasProperty('FN')) {
          // set property
          this.setProperty(
              'fullname',
              'FN' + this.getCharsetString(),
              values.join(' ').trim()
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
  addNote(note)
  {
      this.setProperty(
          'note',
          'NOTE' + this.getCharsetString(),
          note
      )
      return this
  }

  /**
   * Add categories
   *
   * @param array categories
   * @return this
   */
  addCategories(categories)
  {
      this.setProperty(
          'categories',
          'CATEGORIES' + this.getCharsetString(),
          categories.join(',').trim()
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
  addPhoneNumber(number, type = '')
  {
      this.setProperty(
          'phoneNumber',
          'TEL' + ((type != '') ? ';' + type : ''),
          number
      )
      return this
  }

  /**
   * Add Logo
   *
   * @param  string url image url or filename
   * @param  bool include Include the image in our vcard?
   * @return this
   */
  addLogo(url, include = true)
  {
      this.addMedia(
          'LOGO',
          url,
          include,
          'logo'
      )
      return this
  }

  /**
  * Add Photo
  *
  * @param  string url image url or filename
  * @param  bool include Include the image in our vcard?
  * @return this
  */
  addPhoto(url, include = true)
  {
      this.addMedia(
          'PHOTO',
          url,
          include,
          'photo'
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
  addURL(url, type = '')
  {
      this.setProperty(
          'url',
          'URL' + ((type != '') ? ';' + type : ''),
          url
      )
      return this
  }

  /**
   * Build vCard (.vcf)
   *
   * @return string
   */
  buildVCard()
  {
      // init string
      var now = new Date()
      var string = ''
      string += 'BEGIN:VCARD\r\n'
      string += 'VERSION:3.0\r\n'
      string += 'REV:' + now.toISOString() + '\r\n'
      // loop all properties
      var properties = this.getProperties()
      properties.forEach(property => {
          // add to string
          string += this.fold(property['key'] + ':' + this.escape(property['value']) + '\r\n')
      })
      // add to string
      string += 'END:VCARD\r\n'
      // return
      return string
  }

  /**
   * Decode
   *
   * @param  string value The value to decode
   * @return string decoded
   */
  decode(value)
  {
      // convert cyrlic, greek or other caracters to ASCII characters
      return transliterate(value)
  }

  /**
   * Fold a line according to RFC2425 section 5.8.1.
   *
   * @link http://tools.ietf.org/html/rfc2425#section-5.8.1
   * @param  string text
   * @return mixed
   */
  fold(text)
  {
      if (text.length <= 75) {
          return text
      }
      // split, wrap and trim trailing separator
      var chunks = text.match(/.{1,73}/g)
      var wrapped = chunks.join('\r\n ').trim()
      return wrapped + '\r\n'
  }

  /**
   * Escape newline characters according to RFC2425 section 5.8.4.
   *
   * @link http://tools.ietf.org/html/rfc2425#section-5.8.4
   * @param  string text
   * @return string
   */
  escape(text)
  {
      var escapedText = ('' + text).replace('\r\n', '\\n')
      escapedText = escapedText.replace('\n', '\\n')
      return escapedText
  }

  /**
   * Get output as string
   * @deprecated in the future
   *
   * @return string
   */
  toString()
  {
      return this.getOutput()
  }

  /**
   * Get charset
   *
   * @return string
   */
  getCharset()
  {
      return this.charset
  }

  /**
   * Get charset string
   *
   * @return string
   */
  getCharsetString()
  {
      var charsetString = ''
      if (this.charset == 'utf-8') {
          charsetString = ';CHARSET=' + this.charset
      }
      return charsetString
  }

  /**
   * Get content type
   *
   * @return string
   */
  getContentType()
  {
      return this.contentType
  }

  /**
   * Get file extension
   *
   * @return string
   */
  getFileExtension()
  {
      return this.fileExtension
  }

  /**
   * Get output as string
   * iOS devices (and safari < iOS 8 in particular) can not read .vcf (= vcard) files.
   * So I build a workaround to build a .ics (= vcalender) file.
   *
   * @return string
   */
  getOutput()
  {
      return this.buildVCard()
  }

  /**
   * Get properties
   *
   * @return array
   */
  getProperties()
  {
      return this.properties
  }

  /**
   * Has property
   *
   * @param  string key
   * @return bool
   */
  hasProperty(key)
  {
      var pproperties = this.getProperties()
      pproperties.forEach(property => {
        if (property['key'] === key && property['value'] !== '') {
            return true
        }
      })
      return false
  }

  /**
   * Set charset
   *
   * @param  mixed charset
   * @return void
   */
  setCharset(charset)
  {
      this.charset = charset
  }

  /**
   * Set property
   *
   * @param  string element The element name you want to set, f.e.: name, email, phoneNumber, ...
   * @param  string key
   * @param  string value
   * @throws VCardException
   */
  setProperty(element, key, value)
  {
      if (this.multiplePropertiesForElementAllowed.indexOf(element) < 0
          && this.definedElements[element]
      ) {
          throw 'This element already exists (' + element + ')'
      }
      // we define that we set this element
      this.definedElements[element] = true
      // adding property
      this.properties.push({
          'key': key,
          'value': value
      })
  }
}

exports.vCard = vCard
