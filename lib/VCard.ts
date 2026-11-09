import VCardException from './VCardException.js'
import {
  AddressOptions,
  CompanyOptions,
  CustomPropertyOptions,
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
  SocialOptions,
  UrlOptions,
} from './types/VCard.js'
import { buildKey, fold, formatDateTime, quoteParamValue } from './format.js'
import { toMediaInput } from './mime.js'
import {
  DefinedElements,
  ParamSpec,
  PROPERTIES,
  PropertyInput,
  RESERVED_PROPERTY_NAMES,
  StoredProperty,
  StorePropertiesOptions,
} from './properties.js'
import {
  assertName,
  assertNoControlChars,
  assertOptions,
  assertString,
  assertValidDate,
  describeType,
  showValue,
  UTC_OFFSET,
} from './validate.js'
import { VALUE_PIPELINES } from './values.js'
import * as constants from './constants.js'

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
   * Add address.
   *
   * @link   https://tools.ietf.org/html/rfc2426#section-3.2.1
   * @throws VCardException
   */
  public addAddress(options: AddressOptions = {}): this {
    return this.storeProperties({
      options,
      methodName: 'addAddress()',
      map: (options) => {
        const {
          postOfficeBox = '',
          extended = '',
          street = '',
          locality = '',
          region = '',
          postalCode = '',
          country = '',
          type = ['intl', 'postal', 'parcel', 'work'],
        } = options

        return {
          element: 'address',
          value: [
            postOfficeBox,
            extended,
            street,
            locality,
            region,
            postalCode,
            country,
          ],
          params: [{ kind: 'list', value: type }],
        }
      },
    })
  }

  /**
   * Add birthday.
   *
   * A date-time string is written with `VALUE=date-time`.
   *
   * @link   https://tools.ietf.org/html/rfc2426#section-3.1.5
   * @link   https://tools.ietf.org/html/rfc2425#section-5.8.4
   * @param  date A Date object with a UTC year from 0000 to 9999, or a date or
   *              date-time string in the RFC 2425 format
   * @throws VCardException
   * @example
   * vCard.addBirthday(new Date('1990-05-15')) // BDAY:1990-05-15
   * vCard.addBirthday('1990-05-15') // BDAY:1990-05-15
   * vCard.addBirthday('19900515') // BDAY:19900515
   * vCard.addBirthday('1953-10-15T23:10:00Z') // BDAY;VALUE=date-time:1953-10-15T23:10:00Z
   */
  public addBirthday(date: Date | string): this {
    return this.storeProperties({
      value: date,
      map: (value) => ({
        element: 'birthday',
        // Only a date-time contains a T
        valueType:
          typeof value === 'string' && /t/i.test(value)
            ? 'date-time'
            : undefined,
        value,
      }),
    })
  }

  /**
   * Add company.
   *
   * @link   https://tools.ietf.org/html/rfc2426#section-3.5.5
   * @throws VCardException
   */
  public addCompany(options: CompanyOptions): this {
    return this.storeProperties({
      options,
      methodName: 'addCompany()',
      map: (options) => {
        const { name, department = '' } = options

        return {
          element: 'company',
          value: department !== '' ? [name, department] : [name],
        }
      },
    })
  }

  /**
   * Add email.
   *
   * @link   https://tools.ietf.org/html/rfc2426#section-3.3.2
   * @throws VCardException
   */
  public addEmail(options: EmailOptions): this {
    return this.storeProperties({
      options,
      methodName: 'addEmail()',
      map: (options) => {
        const { address, type = [] } = options

        return {
          element: 'email',
          value: address,
          params: [{ kind: 'list', value: type }],
        }
      },
    })
  }

  /**
   * Add public key (base64-encoded, as text or by URL).
   *
   * @link   https://tools.ietf.org/html/rfc2426#section-3.7.1
   * @throws VCardException
   * @example
   * vCard.addKey({ url: 'https://example.com/key.pub' }) // KEY;VALUE=uri:https://example.com/key.pub
   * vCard.addKey({ text: armoredKey }) // KEY;VALUE=text;TYPE=PGP:-----BEGIN PGP PUBLIC KEY BLOCK-----\n…
   * vCard.addKey({ key: base64cert, mime: 'X509' }) // KEY;ENCODING=b;TYPE=X509:…
   */
  public addKey(options: KeyOptions): this {
    return this.storeProperties({
      options,
      methodName: 'addKey()',
      map: (options) => {
        // An undefined form key, such as `url: undefined`, selects no form
        if (options.url !== undefined) {
          return { element: 'key', valueType: 'uri', value: options.url }
        }

        const mime = options.mime ?? 'PGP'
        // RFC 2426 allows no empty key type, so an empty mime writes no TYPE
        const params: ParamSpec[] =
          mime === ''
            ? []
            : [{ kind: 'single', name: 'TYPE', value: mime, upper: true }]

        if (options.text !== undefined) {
          return {
            element: 'key',
            valueType: 'text',
            value: options.text,
            params,
          }
        }

        return { element: 'key', value: options.key, params }
      },
    })
  }

  /**
   * Add jobtitle.
   *
   * @link   https://tools.ietf.org/html/rfc2426#section-3.5.1
   * @throws VCardException
   */
  public addJobtitle(jobtitle: string): this {
    return this.storeProperties({
      value: jobtitle,
      map: (value) => ({
        element: 'jobtitle',
        value,
      }),
    })
  }

  /**
   * Add role.
   *
   * @link   https://tools.ietf.org/html/rfc2426#section-3.5.2
   * @throws VCardException
   */
  public addRole(role: string): this {
    return this.storeProperties({
      value: role,
      map: (value) => ({
        element: 'role',
        value,
      }),
    })
  }

  /**
   * Add formatted name (FN) directly.
   *
   * When set, overrides the auto-generated FN from addName().
   * Useful for mononyms, company-as-contact, or custom formatting.
   *
   * @link   https://tools.ietf.org/html/rfc2426#section-3.1.1
   * @throws VCardException
   */
  public addFullName(fullName: string): this {
    return this.storeProperties({
      value: fullName,
      map: (value) => ({
        element: 'fullname',
        value,
      }),
    })
  }

  /**
   * Add name.
   *
   * @link   https://tools.ietf.org/html/rfc2426#section-3.1.2
   * @throws VCardException
   */
  public addName(options: NameOptions = {}): this {
    return this.storeProperties({
      options,
      methodName: 'addName()',
      map: (options) => {
        const {
          familyName = '',
          givenName = '',
          additionalNames = '',
          honorificPrefix = '',
          honorificSuffix = '',
        } = options

        const inputs: PropertyInput[] = [
          {
            element: 'name',
            value: [
              familyName,
              givenName,
              additionalNames,
              honorificPrefix,
              honorificSuffix,
            ],
          },
        ]

        const parts = [
          honorificPrefix,
          givenName,
          additionalNames,
          familyName,
          honorificSuffix,
        ]
        const hasFullName = this.properties.some(
          (property) => property.key.split(';')[0] === 'FN',
        )

        // A non-string part makes the N input throw first. join() would throw
        // a TypeError on a null-prototype object.
        if (!hasFullName && parts.every((part) => typeof part === 'string')) {
          const fullName = parts.filter(Boolean).join(' ').trim()

          if (fullName !== '') {
            inputs.push({ element: 'fullname', value: fullName })
          }
        }

        return inputs
      },
    })
  }

  /**
   * Add nickname.
   *
   * @link   https://tools.ietf.org/html/rfc2426#section-3.1.3
   * @throws VCardException
   */
  public addNickname(nickname: string | string[]): this {
    return this.storeProperties({
      value: nickname,
      map: (value) => ({
        element: 'nickname',
        valueType: Array.isArray(value) ? 'text-list' : 'text',
        value,
      }),
    })
  }

  /**
   * Add note.
   *
   * @link   https://tools.ietf.org/html/rfc2426#section-3.6.2
   * @throws VCardException
   */
  public addNote(note: string): this {
    return this.storeProperties({
      value: note,
      map: (value) => ({
        element: 'note',
        value,
      }),
    })
  }

  /**
   * Add categories.
   *
   * @link   https://tools.ietf.org/html/rfc2426#section-3.6.1
   * @throws VCardException
   */
  public addCategories(categories: string[]): this {
    return this.storeProperties({
      value: categories,
      map: (value) => ({
        element: 'categories',
        value,
      }),
    })
  }

  /**
   * Add phone number.
   *
   * @deprecated Pass `number` as a string. A number loses leading zeros and
   * the `+` sign. Removed in the next major version.
   * @link   https://tools.ietf.org/html/rfc2426#section-3.3.1
   * @throws VCardException
   */
  public addPhoneNumber(options: PhoneOptions & { number: number }): this
  /**
   * Add phone number.
   *
   * @link   https://tools.ietf.org/html/rfc2426#section-3.3.1
   * @throws VCardException
   */
  public addPhoneNumber(options: PhoneOptions): this
  public addPhoneNumber(options: PhoneOptions): this {
    return this.storeProperties({
      options,
      methodName: 'addPhoneNumber()',
      map: (options) => {
        const { number, type = [] } = options

        // Plain JavaScript callers can pass null or undefined, which would be
        // written as text
        if (typeof number !== 'string' && typeof number !== 'number') {
          throw new VCardException(
            `Phone number values must be strings or numbers (got ${describeType(number)})`,
          )
        }

        if (typeof number === 'number' && !Number.isFinite(number)) {
          throw new VCardException(
            `Phone number values must be finite numbers (got ${number})`,
          )
        }

        return {
          element: 'phoneNumber',
          value: `${number}`,
          params: [{ kind: 'list', value: type }],
        }
      },
    })
  }

  /**
   * Add logo (base64-encoded or by URL).
   *
   * @link   https://tools.ietf.org/html/rfc2426#section-3.5.3
   * @throws VCardException
   */
  public addLogo(options: LogoOptions): this {
    return this.storeProperties({
      options,
      methodName: 'addLogo()',
      map: (options) => toMediaInput('logo', options),
    })
  }

  /**
   * Add photo (base64-encoded or by URL).
   *
   * @link   https://tools.ietf.org/html/rfc2426#section-3.1.4
   * @throws VCardException
   */
  public addPhoto(options: PhotoOptions): this {
    return this.storeProperties({
      options,
      methodName: 'addPhoto()',
      map: (options) => toMediaInput('photo', options),
    })
  }

  /**
   * Add URL.
   *
   * @link   https://tools.ietf.org/html/rfc2426#section-3.6.8
   * @throws VCardException
   */
  public addUrl(options: UrlOptions): this {
    return this.storeProperties({
      options,
      methodName: 'addUrl()',
      map: (options) => {
        const { url, type = [] } = options

        return {
          element: 'url',
          value: url,
          params: [{ kind: 'list', value: type }],
        }
      },
    })
  }

  /**
   * Add social profile.
   * Emits both X-SOCIALPROFILE (iOS/macOS) and IMPP (RFC 4770) for cross-platform compatibility.
   *
   * @link   https://tools.ietf.org/html/rfc4770#section-1
   * @throws VCardException
   */
  public addSocial(options: SocialOptions): this {
    return this.storeProperties({
      options,
      methodName: 'addSocial()',
      map: (options) => {
        const { url, type, user = '' } = options

        const socialParams: ParamSpec[] = []
        const imppParams: ParamSpec[] = []

        if (type !== '') {
          socialParams.push({ kind: 'single', name: 'type', value: type })
          imppParams.push({
            kind: 'single',
            name: 'X-SERVICE-TYPE',
            value: type,
          })
        }

        if (user !== '') {
          socialParams.push({ kind: 'single', name: 'x-user', value: user })
        }

        return [
          { element: 'social', value: url, params: socialParams },
          { element: 'impp', value: url, params: imppParams },
        ]
      },
    })
  }

  /**
   * Add IMPP (Instant Messaging and Presence Protocol) entry.
   *
   * @link   https://tools.ietf.org/html/rfc4770#section-1
   * @throws VCardException
   */
  public addImpp(options: ImppOptions): this {
    return this.storeProperties({
      options,
      methodName: 'addImpp()',
      map: (options) => {
        const { uri, serviceType = '' } = options

        return {
          element: 'impp',
          value: uri,
          params:
            serviceType !== ''
              ? [{ kind: 'single', name: 'X-SERVICE-TYPE', value: serviceType }]
              : [],
        }
      },
    })
  }

  /**
   * Add UID.
   *
   * @link   https://tools.ietf.org/html/rfc2426#section-3.6.7
   * @throws VCardException
   */
  public addUid(uid: string): this {
    return this.storeProperties({
      value: uid,
      map: (value) => ({
        element: 'uid',
        value,
      }),
    })
  }

  /**
   * Add geographic position.
   *
   * @link   https://tools.ietf.org/html/rfc2426#section-3.4.2
   * @throws VCardException
   */
  public addGeo(options: GeoOptions): this {
    return this.storeProperties({
      options,
      methodName: 'addGeo()',
      map: (value) => ({
        element: 'geo',
        value,
      }),
    })
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
    return this.storeProperties({
      value: timezone,
      map: (value) => {
        // test() would turn an object into a string and match it
        assertString({ value, label: PROPERTIES.timezone.label })

        return {
          element: 'timezone',
          valueType: UTC_OFFSET.test(value) ? 'utc-offset' : 'text',
          value,
        }
      },
    })
  }

  /**
   * Add sort string for name ordering (useful for CJK names).
   *
   * @link   https://tools.ietf.org/html/rfc2426#section-3.6.5
   * @throws VCardException
   */
  public addSortString(sortString: string): this {
    return this.storeProperties({
      value: sortString,
      map: (value) => ({
        element: 'sortString',
        value,
      }),
    })
  }

  /**
   * Add revision timestamp.
   *
   * When set, overrides the auto-generated REV timestamp. The value is written
   * in UTC without a fraction of a second, such as `2024-01-15T10:30:00Z`.
   *
   * @link   https://tools.ietf.org/html/rfc2426#section-3.6.4
   * @param  date A Date object with a UTC year from 0000 to 9999
   * @throws VCardException
   */
  public addRevision(date: Date): this {
    return this.storeProperties({
      value: date,
      map: (value) => {
        // The date-time pipeline also accepts strings, for birthdays
        assertValidDate({
          date: value,
          label: PROPERTIES.revision.label.toLowerCase(),
        })

        return {
          element: 'revision',
          value,
        }
      },
    })
  }

  /**
   * Add formatted address label.
   *
   * @link   https://tools.ietf.org/html/rfc2426#section-3.2.2
   * @throws VCardException
   */
  public addLabel(options: LabelOptions): this {
    return this.storeProperties({
      options,
      methodName: 'addLabel()',
      map: (options) => {
        const { label, type = ['intl', 'postal', 'parcel', 'work'] } = options

        return {
          element: 'label',
          value: label,
          params: [{ kind: 'list', value: type }],
        }
      },
    })
  }

  /**
   * Add a custom property. Use this for non-standard X- properties
   * or any property not covered by the built-in methods.
   *
   * NOTE: Values are NOT automatically escaped. If your value contains
   * special characters (semicolons, commas, backslashes), you are
   * responsible for escaping them. A control character other than tab,
   * such as a line break, throws. `name` and `group` may contain only
   * letters, digits and `-`. The names `BEGIN`, `END`, `VERSION`, `PRODID`
   * and `REV` throw. The check ignores case. Use `addRevision()` to set `REV`.
   * `params` must be `name=value` pairs separated by `;`. Put a value with
   * `;`, `:` or `,` in double quotes. A bare parameter, such as `WORK`,
   * throws.
   *
   * @throws VCardException
   * @example
   * vCard.addCustomProperty({ name: 'X-PHONETIC-FIRST-NAME', value: 'Jon' })
   * vCard.addCustomProperty({ name: 'X-ANNIVERSARY', value: '2010-06-15' })
   * vCard.addCustomProperty({ name: 'X-CUSTOM', value: 'val', params: 'TYPE=work' })
   * vCard.addCustomProperty({ name: 'TEL', value: '+1-555', group: 'item1' })
   */
  public addCustomProperty(options: CustomPropertyOptions): this {
    return this.storeProperties({
      options,
      methodName: 'addCustomProperty()',
      map: (options) => {
        const { name, value, params = '', group } = options

        assertName({ value: name, label: 'Property name' })
        const upperName = name.toUpperCase()
        const hint = RESERVED_PROPERTY_NAMES.get(upperName)
        if (hint !== undefined) {
          throw new VCardException(
            `Property name ${showValue(name)} is reserved${hint}`,
          )
        }

        return {
          element: 'custom',
          name: upperName,
          value,
          rawParams: params,
          group,
          label: upperName,
        }
      },
    })
  }

  /**
   * Check the options, map them to property inputs, run the value pipeline
   * and build the key of each input, then store them. Nothing is stored when
   * an input throws.
   *
   * @throws VCardException
   */
  private storeProperties<T>(args: StorePropertiesOptions<T>): this {
    let value: T
    if ('options' in args) {
      assertOptions({ value: args.options, label: args.methodName })
      value = args.options
    } else {
      value = args.value
    }

    const mapped = args.map(value)
    const inputs = Array.isArray(mapped) ? mapped : [mapped]

    const properties: StoredProperty[] = inputs.map((input) => {
      const spec = PROPERTIES[input.element]
      const valueType = input.valueType ?? spec.valueType
      const label = input.label ?? spec.label

      const value = VALUE_PIPELINES[valueType](input.value, label)
      const key = buildKey({
        name: input.name ?? spec.name,
        valueType,
        defaultType: spec.valueType,
        params: input.params,
        rawParams: input.rawParams,
        label,
      })

      // An empty group writes no prefix
      if (input.group !== undefined && input.group !== '') {
        assertName({ value: input.group, label: `${label} group` })
      }

      return { element: input.element, key, value, group: input.group }
    })

    // A copy, so 2 inputs of the same single element in 1 call also throw
    const definedElements = { ...this.definedElements }
    for (const { element } of properties) {
      if (!PROPERTIES[element].multiple && definedElements[element]) {
        const { label, name } = PROPERTIES[element]
        throw new VCardException(`${label} already exists (${name})`)
      }

      definedElements[element] = true
    }

    this.definedElements = definedElements
    this.properties.push(...properties)

    return this
  }

  /**
   * Build vCard (.vcf).
   *
   * @deprecated Use `toString()`. Removed in the next major version.
   */
  public buildVCard(): string {
    // Calls build() directly so a subclass toString() that calls
    // buildVCard() does not recurse.
    return this.build()
  }

  private build(): string {
    const parts: string[] = [
      'BEGIN:VCARD\r\n',
      'VERSION:3.0\r\n',
      `PRODID:-//vcard-creator//vcard-creator ${constants.LIB_VERSION}//EN\r\n`,
    ]

    if (!this.definedElements['revision']) {
      parts.push(`REV:${formatDateTime(new Date())}\r\n`)
    }

    const charsetStr = this.charsetParam()
    for (const property of this.properties) {
      const prefix = property.group ? `${property.group}.` : ''
      const charset = PROPERTIES[property.element].charset ? charsetStr : ''
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
   * @throws VCardException
   */
  public getCharsetString(): string {
    return this.charsetParam()
  }

  /**
   * @throws VCardException
   */
  private charsetParam(): string {
    // `charset` is a public field, so it is checked here at build time
    assertNoControlChars({
      value: this.charset,
      label: 'Charset',
      allowTab: true,
    })

    if (this.charset !== constants.DEFAULT_CHARACTER_SET) {
      return `;CHARSET=${quoteParamValue({ value: this.charset, label: 'Charset' })}`
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
   * @throws VCardException
   */
  public setCharset(charset: string): void {
    assertString({ value: charset, label: 'Charset' })

    this.charset = charset
  }

  /**
   * Set filename.
   *
   * @deprecated Choose the file name in your code. The library never saves
   * files. Removed in the next major version.
   * @throws VCardException
   */
  public setFilename(value: string): void {
    if (!value) {
      return
    }

    assertString({ value, label: 'Filename' })

    this.filename = value
  }
}
