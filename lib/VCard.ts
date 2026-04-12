import VCardException from './VCardException.js'
import {
  AnniversaryOptions,
  AddressOptions,
  CompanyOptions,
  CustomPropertyOptions,
  DefinedElements,
  Element,
  EmailOptions,
  GenderOptions,
  GeoOptions,
  ImppOptions,
  KeyOptions,
  KindType,
  LabelOptions,
  LangOptions,
  LogoOptions,
  NameOptions,
  PhoneOptions,
  PhotoOptions,
  Property,
  RelatedOptions,
  SetPropertyOptions,
  SocialOptions,
  StoredProperty,
  UrlOptions,
  VCardOptions,
  VCardVersion,
} from './types/VCard.js'
import {
  buildParam,
  buildPrefParam,
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
  private readonly contentType: string = constants.CONTENT_TYPE

  /**
   * Default filename.
   */
  private filename: string = constants.DEFAULT_FILENAME

  /**
   * Default fileExtension.
   */
  private readonly fileExtension: string = constants.DEFAULT_EXTENSION

  /**
   * Properties.
   */
  private readonly properties: StoredProperty[] = []

  /**
   * Defined elements.
   */
  private definedElements: DefinedElements = {}

  /**
   * vCard spec version for this instance (3 = RFC 2426, 4 = RFC 6350).
   */
  private readonly version: VCardVersion

  /**
   * Whether to emit RFC 6350 §3.3 group prefixes on properties that carry a `group` option.
   */
  private readonly useGroups: boolean

  /**
   * Multiple properties for element allowed.
   */
  private readonly multiplePropertiesForElementAllowed: ReadonlySet<Element>

  /**
   * Create a VCard instance.
   *
   * @param options  Optional configuration including `version` (3 or 4) and `useGroups`.
   * @example
   * new VCard()                  // vCard 3.0 (RFC 2426) — default, zero breaking changes
   * new VCard({ version: 4 })   // vCard 4.0 (RFC 6350)
   * VCard.v4()                   // vCard 4.0 — ergonomic alias
   */
  constructor(options?: VCardOptions) {
    this.version = options?.version ?? 3
    this.useGroups = options?.useGroups ?? false

    // In v4 mode, FN cardinality is 1* (one or more) — multiple FN properties are permitted.
    const allowedMultiple = new Set(constants.ALLOWED_MULTIPLE_PROPERTIES)
    if (this.version === 4) {
      allowedMultiple.add('fullname')
    }
    this.multiplePropertiesForElementAllowed = allowedMultiple
  }

  /**
   * Create a vCard 4.0 (RFC 6350) instance.
   *
   * Equivalent to `new VCard({ version: 4 })`.
   *
   * @example
   * VCard.v4().addFullName('Ada Lovelace').addGender({ sex: 'F' })
   */
  public static v4(): VCard {
    return new VCard({ version: 4 })
  }

  /**
   * Returns the vCard version this instance is configured for.
   *
   * @returns `3` for RFC 2426 (vCard 3.0) or `4` for RFC 6350 (vCard 4.0).
   */
  public getVersion(): VCardVersion {
    return this.version
  }

  /**
   * Returns whether this instance emits RFC 6350 §3.3 group prefixes.
   */
  public getUseGroups(): boolean {
    return this.useGroups
  }

  /**
   * Assert that this instance is in vCard 4.0 mode.
   * Throws a VCardException with a helpful message if called on a v3 instance.
   *
   * @param methodName  The name of the calling method, included in the error message.
   * @throws VCardException When called on a vCard 3.0 instance.
   */
  private assertV4(methodName: string): void {
    if (this.version !== 4) {
      throw new VCardException(
        `${methodName}() is only available in vCard 4.0 mode. ` +
          `Use VCard.v4() or new VCard({ version: 4 }) to opt in.`,
      )
    }
  }

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
    label,
    geo,
    tz,
    altid,
    pref,
    pid,
    group,
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

    const hadPref =
      this.version === 4 && type.map((t) => t.toLowerCase()).includes('pref')
    const resolved = resolveType(type, this.version)
    const keyParts: string[] = [resolved]

    if (this.version === 4) {
      const escapeQuotedParamValue = (input: string): string =>
        input
          .replaceAll('\r\n', String.raw`\n`)
          .replaceAll('\r', String.raw`\n`)
          .replaceAll('\n', String.raw`\n`)
          .replaceAll('"', String.raw`\"`)
      const labelParam = label
        ? `LABEL="${escapeQuotedParamValue(escapeText(label))}"`
        : ''
      keyParts.push(
        hadPref ? 'PREF=1' : buildPrefParam(pref),
        labelParam,
        geo ? `GEO="${escapeQuotedParamValue(geo)}"` : '',
        tz ? `TZ="${escapeQuotedParamValue(tz)}"` : '',
        buildParam('ALTID', altid),
        buildParam('PID', pid),
      )
    }

    const key = ['ADR', ...keyParts.filter(Boolean)].join(';')
    this.setProperty({
      element: 'address',
      key,
      value,
      group: this.useGroups && group ? group : undefined,
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
  public addBirthday(date: Date | string, calscale?: string): this {
    const value = date instanceof Date ? date.toISOString().slice(0, 10) : date
    let key = 'BDAY'
    if (this.version === 4 && calscale) key += `;CALSCALE=${calscale}`
    this.setProperty({ element: 'birthday', key, value })

    return this
  }

  /**
   * Add company.
   *
   * @link   https://tools.ietf.org/html/rfc2426#section-3.5.5
   */
  public addCompany({ name, department = '', sortAs }: CompanyOptions): this {
    const escapedName = escapeText(name)
    const escapedDept = department === '' ? '' : `;${escapeText(department)}`
    let key = 'ORG'
    if (this.version === 4 && sortAs) {
      const escapedSortAs = sortAs.replaceAll('"', String.raw`"`)
      key += `;SORT-AS="${escapedSortAs}"`
    }
    this.setProperty({
      element: 'company',
      key,
      value: escapedName + escapedDept,
    })

    return this
  }

  /**
   * Add email.
   *
   * @link   https://tools.ietf.org/html/rfc2426#section-3.3.2
   */
  public addEmail({
    address,
    type = [],
    pref,
    altid,
    pid,
    group,
  }: EmailOptions): this {
    const hadPref =
      this.version === 4 && type.map((t) => t.toLowerCase()).includes('pref')
    const resolved = resolveType(type, this.version)
    let key = resolved === '' ? 'EMAIL' : `EMAIL;${resolved}`

    if (this.version === 4) {
      if (hadPref) key += ';PREF=1'
      else {
        const prefStr = buildPrefParam(pref)
        if (prefStr !== '') key += `;${prefStr}`
      }
      const altidStr = buildParam('ALTID', altid)
      if (altidStr !== '') key += `;${altidStr}`
      const pidStr = buildParam('PID', pid)
      if (pidStr !== '') key += `;${pidStr}`
    }

    this.setProperty({
      element: 'email',
      key,
      value: address,
      group: this.useGroups && group ? group : undefined,
    })

    return this
  }

  /**
   * Add public key (base64-encoded or by URL).
   *
   * @link   https://tools.ietf.org/html/rfc2426#section-3.7.1
   */
  public addKey(options: KeyOptions): this {
    if ('url' in options) {
      const mtParam =
        this.version === 4 && options.mediaType
          ? `;MEDIATYPE=${options.mediaType}`
          : ''
      this.setProperty({
        element: 'key',
        key: `KEY;VALUE=uri${mtParam}`,
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
   */
  private addMediaUrl(
    property: string,
    url: string,
    element: Element,
    mediaType?: string,
  ): this {
    const mtParam =
      this.version === 4 && mediaType ? `;MEDIATYPE=${mediaType}` : ''
    this.setProperty({
      element,
      key: `${property};VALUE=uri${mtParam}`,
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
    encoding: 'b' | 'BASE64' = 'b',
  ): this {
    if (!isValidMimeType(mime)) {
      throw new VCardException(`The MIME Media Type is invalid (${mime})`)
    }

    this.setProperty({
      element,
      key: `${property};ENCODING=${encoding};TYPE=${mime.toUpperCase()}`,
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
    sortAs,
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

    // Build N property key: in v4 mode, apply SORT-AS option directly.
    let nameKey = 'N'
    if (this.version === 4 && sortAs) {
      const escapedSortAs = sortAs.replaceAll('"', String.raw`"`)
      nameKey += `;SORT-AS="${escapedSortAs}"`
    }

    this.setProperty({
      element: 'name',
      key: nameKey,
      value: property,
    })

    // In v4 mode, check if addSortString() was called before addName().
    // If a pending V4-SORT-AS entry exists and no sortAs was provided inline, apply it now.
    if (this.version === 4 && !sortAs) {
      const pendingIdx = this.properties.findIndex(
        (p) => p.element === 'sortString' && p.key === 'V4-SORT-AS',
      )
      if (pendingIdx !== -1) {
        const pending = this.properties[pendingIdx]
        const nameProperty = this.properties.find((p) => p.element === 'name')
        if (nameProperty) {
          const escapedPending = pending.value.replaceAll('"', String.raw`"`)
          nameProperty.key = `${nameProperty.key};SORT-AS="${escapedPending}"`
        }
        this.properties.splice(pendingIdx, 1)
        delete this.definedElements['sortString']
      }
    }

    const fnValue = escapeText(values.join(' ').trim())
    if (!this.hasProperty('FN') && fnValue !== '') {
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
  public addPhoneNumber({
    number,
    type = [],
    value: valueType,
    pref,
    altid,
    pid,
    group,
  }: PhoneOptions): this {
    const hadPref =
      this.version === 4 && type.map((t) => t.toLowerCase()).includes('pref')
    const resolved = resolveType(type, this.version)
    const effectiveValueType =
      this.version === 4 ? (valueType ?? 'uri') : undefined

    const keyParts: string[] = ['TEL']
    if (effectiveValueType === 'uri') keyParts.push('VALUE=uri')
    keyParts.push(resolved)

    if (this.version === 4) {
      keyParts.push(
        hadPref ? 'PREF=1' : buildPrefParam(pref),
        buildParam('ALTID', altid),
        buildParam('PID', pid),
      )
    }

    const key = keyParts.filter(Boolean).join(';')
    // RFC 6350 §6.4.1 / RFC 3966: VALUE=uri requires a tel: URI, not a bare
    // number. Auto-normalise by prepending "tel:" when no URI scheme is present.
    const hasUriScheme = /^[a-zA-Z][a-zA-Z0-9+\-.]*:/.test(`${number}`)
    const resolvedNumber =
      effectiveValueType === 'uri' && !hasUriScheme
        ? `tel:${number}`
        : `${number}`
    this.setProperty({
      element: 'phoneNumber',
      key,
      value: resolvedNumber,
      group: this.useGroups && group ? group : undefined,
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
      this.addMediaUrl('LOGO', options.url, 'logo', options.mediaType)
    } else {
      this.addMediaContent(
        'LOGO',
        options.image,
        options.mime ?? constants.DEFAULT_MIME_TYPE,
        'logo',
        options.encoding ?? 'b',
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
      this.addMediaUrl('PHOTO', options.url, 'photo', options.mediaType)
    } else {
      this.addMediaContent(
        'PHOTO',
        options.image,
        options.mime ?? constants.DEFAULT_MIME_TYPE,
        'photo',
        options.encoding ?? 'b',
      )
    }

    return this
  }

  /**
   * Add URL.
   *
   * @link   https://tools.ietf.org/html/rfc2426#section-3.6.8
   */
  public addUrl({
    url,
    type = [],
    pref,
    altid,
    pid,
    mediaType,
    group,
  }: UrlOptions): this {
    const resolved = resolveType(type, this.version)
    let key = resolved === '' ? 'URL' : `URL;${resolved}`

    if (this.version === 4) {
      const prefStr = buildPrefParam(pref)
      if (prefStr !== '') key += `;${prefStr}`
      const altidStr = buildParam('ALTID', altid)
      if (altidStr !== '') key += `;${altidStr}`
      const pidStr = buildParam('PID', pid)
      if (pidStr !== '') key += `;${pidStr}`
      const mtStr = buildParam('MEDIATYPE', mediaType)
      if (mtStr !== '') key += `;${mtStr}`
    }

    this.setProperty({
      element: 'url',
      key,
      value: url,
      group: this.useGroups && group ? group : undefined,
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
    const socialUser = user === '' ? '' : `;x-user=${user}`
    const socialProfile = type === '' ? '' : `;type=${type}`

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
  public addImpp({
    uri,
    serviceType = '',
    pref,
    pid,
    group,
  }: ImppOptions): this {
    const svcType = serviceType === '' ? '' : `;X-SERVICE-TYPE=${serviceType}`
    let key = `IMPP${svcType}`

    if (this.version === 4) {
      const prefStr = buildPrefParam(pref)
      if (prefStr !== '') key += `;${prefStr}`
      const pidStr = buildParam('PID', pid)
      if (pidStr !== '') key += `;${pidStr}`
    }

    this.setProperty({
      element: 'impp',
      key,
      value: uri,
      group: this.useGroups && group ? group : undefined,
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

    // v3: GEO:<lat>;<lon>  (RFC 2426 §3.4.2)
    // v4: GEO:geo:<lat>,<lon>  (RFC 6350 §6.5.2 — geo URI scheme)
    const geoValue =
      this.version === 4
        ? `geo:${latitude},${longitude}`
        : `${latitude};${longitude}`

    this.setProperty({
      element: 'geo',
      key: 'GEO',
      value: geoValue,
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
    if (this.version === 4) {
      // v4: SORT-STRING is deprecated (RFC 6350 Appendix A.2).
      // Apply SORT-AS as a parameter on the N property instead.
      const nameProperty = this.properties.find((p) => p.element === 'name')
      if (nameProperty) {
        // N already exists — append SORT-AS to its parameter list.
        nameProperty.key = `${nameProperty.key};SORT-AS="${sortString}"`
      } else {
        // N not yet added — store as a pending marker for addName() to pick up.
        this.setProperty({
          element: 'sortString',
          key: 'V4-SORT-AS',
          value: sortString,
        })
      }
    } else {
      this.setProperty({
        element: 'sortString',
        key: `SORT-STRING`,
        value: escapeText(sortString),
      })
    }

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
    if (this.version === 4) {
      // In vCard 4.0 (RFC 6350), the standalone LABEL property is not emitted.
      // Use addAddress({ label: '...' }) to attach a label to a specific address.
      // The setProperty call is skipped to avoid emitting an invalid v4 property.
      return this
    }

    const resolved = resolveType(type, this.version)
    const key = resolved === '' ? 'LABEL' : `LABEL;${resolved}`
    this.setProperty({
      element: 'label',
      key,
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
    const keyStr =
      params === '' ? name.toUpperCase() : `${name.toUpperCase()};${params}`
    this.setProperty({
      element: 'custom',
      key: keyStr,
      value,
      group,
    })

    return this
  }

  /**
   * Build vCard (.vcf).
   */
  public buildVCard(): string {
    const versionLine =
      this.version === 4 ? 'VERSION:4.0\r\n' : 'VERSION:3.0\r\n'
    const parts: string[] = [
      'BEGIN:VCARD\r\n',
      versionLine,
      `PRODID:-//vcard-creator//vcard-creator ${constants.LIB_VERSION}//EN\r\n`,
    ]

    if (!this.definedElements['revision']) {
      parts.push(`REV:${new Date().toISOString()}\r\n`)
    }

    // vCard 4.0 mandates UTF-8 implicitly — CHARSET parameter is suppressed.
    const charsetStr = this.version === 3 ? this.getCharsetString() : ''

    for (const property of this.properties) {
      // In v4 mode, skip standalone LABEL (deprecated; use LABEL= param on ADR instead)
      // and skip sortString entries that were applied to the N property as SORT-AS.
      if (
        this.version === 4 &&
        (property.element === 'label' ||
          (property.element === 'sortString' && property.key === 'V4-SORT-AS'))
      )
        continue

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
    return this.properties.map(({ key, value, group }) => ({
      key,
      value,
      group,
    }))
  }

  /**
   * Has property.
   */
  public hasProperty(key: string): boolean {
    return this.properties.some((property) => property.key === key)
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

  // ── vCard 4.0 (RFC 6350) only ─────────────────────────────────────────────

  /**
   * Add KIND property (RFC 6350 §6.1.4).
   *
   * Describes the type of entity the vCard represents.
   * Common values are `'individual'`, `'group'`, `'org'`, and `'location'`.
   *
   * @param kind  The kind value (case-insensitive; stored in lower case).
   * @throws VCardException When called on a vCard 3.0 instance.
   * @example
   * VCard.v4().addKind('org')
   */
  public addKind(kind: KindType): this {
    this.assertV4('addKind')
    this.setProperty({
      element: 'kind',
      key: 'KIND',
      value: kind.toLowerCase(),
    })
    return this
  }

  /**
   * Add SOURCE property (RFC 6350 §6.1.3).
   *
   * A URI indicating a source for the vCard data (e.g., an LDAP directory URL).
   * Multiple SOURCE properties are permitted.
   *
   * @param url  The URI of the data source.
   * @throws VCardException When called on a vCard 3.0 instance.
   * @example
   * VCard.v4().addSource('ldap://example.com/cn=Ada')
   */
  public addSource(url: string): this {
    this.assertV4('addSource')
    this.setProperty({ element: 'source', key: 'SOURCE', value: url })
    return this
  }

  /**
   * Add XML property (RFC 6350 §6.1.5).
   *
   * Carries arbitrary XML markup associated with the vCard.
   * Multiple XML properties are permitted.
   *
   * @param xml  The raw XML string.
   * @throws VCardException When called on a vCard 3.0 instance.
   * @example
   * VCard.v4().addXml('<foo xmlns="urn:example"/>');
   */
  public addXml(xml: string): this {
    this.assertV4('addXml')
    this.setProperty({ element: 'xml', key: 'XML', value: xml })
    return this
  }

  /**
   * Add ANNIVERSARY property (RFC 6350 §6.2.6).
   *
   * Records the date of marriage or a significant relationship for the object the vCard represents.
   *
   * @param options.date     A `Date` object or an ISO 8601 date string (e.g., `'2010-06-15'`).
   * @param options.calscale Optional calendar system (e.g., `'gregorian'`). Omit for ISO 8601 dates.
   * @throws VCardException When called on a vCard 3.0 instance.
   * @example
   * VCard.v4().addAnniversary({ date: new Date('2010-06-15') })
   * VCard.v4().addAnniversary({ date: '20100615', calscale: 'gregorian' })
   */
  public addAnniversary({ date, calscale }: AnniversaryOptions): this {
    this.assertV4('addAnniversary')
    const value = date instanceof Date ? date.toISOString().slice(0, 10) : date
    let key = 'ANNIVERSARY'
    if (calscale) key += `;CALSCALE=${calscale}`
    this.setProperty({ element: 'anniversary', key, value })
    return this
  }

  /**
   * Add GENDER property (RFC 6350 §6.2.7).
   *
   * Specifies the components of the sex and gender identity of the vCard's subject.
   *
   * @param options.sex       Optional sex component: `'M'`, `'F'`, `'O'`, `'N'`, or `'U'`.
   *                          Omit or pass `undefined` to set only a gender identity string.
   * @param options.identity  Optional free-form gender identity text (e.g., `'she/her'`).
   * @throws VCardException When called on a vCard 3.0 instance.
   * @example
   * VCard.v4().addGender({ sex: 'F' })
   * VCard.v4().addGender({ sex: 'O', identity: 'non-binary' })
   * VCard.v4().addGender({ identity: 'they/them' })
   */
  public addGender({ sex, identity }: GenderOptions): this {
    this.assertV4('addGender')
    const hasSex = sex !== undefined
    const hasIdentity = identity !== undefined && identity !== ''
    if (!hasSex && !hasIdentity) {
      throw new VCardException(
        'addGender requires at least one of "sex" or "identity".',
      )
    }
    const escapedIdentity = hasIdentity ? escapeText(identity) : undefined
    let value: string
    if (hasSex && escapedIdentity) {
      value = `${sex};${escapedIdentity}`
    } else if (hasSex) {
      value = sex!
    } else {
      value = escapedIdentity!
    }
    this.setProperty({ element: 'gender', key: 'GENDER', value })
    return this
  }

  /**
   * Add LANG property (RFC 6350 §6.4.4).
   *
   * Defines the language(s) the vCard's subject can be addressed in.
   * Multiple LANG properties are permitted; use `pref` to express order of preference.
   *
   * @param options.language  A language tag (e.g., `'en'`, `'fr'`, `'zh-Hant'`).
   * @param options.type      Optional TYPE parameter value (e.g., `'work'`, `'home'`).
   * @param options.pref      Optional preference (1 = highest, 100 = lowest).
   * @throws VCardException When called on a vCard 3.0 instance.
   * @example
   * VCard.v4().addLang({ language: 'en', pref: 1 })
   * VCard.v4().addLang({ language: 'fr', type: 'work', pref: 2 })
   */
  public addLang({ language, type, pref }: LangOptions): this {
    this.assertV4('addLang')
    let key = 'LANG'
    if (type && type.length > 0) key += `;${resolveType(type, 4)}`
    const prefStr = buildPrefParam(pref)
    if (prefStr !== '') key += `;${prefStr}`
    this.setProperty({ element: 'lang', key, value: language })
    return this
  }

  /**
   * Add MEMBER property (RFC 6350 §6.6.5).
   *
   * Used when `KIND:group` — identifies a member of the group the vCard represents.
   * The value MUST be a URI. Multiple MEMBER properties are permitted.
   *
   * @param uri  A URI identifying the group member.
   * @throws VCardException When called on a vCard 3.0 instance.
   * @example
   * VCard.v4().addKind('group').addMember('mailto:alice@example.com')
   * VCard.v4().addKind('group').addMember('urn:uuid:03a0e51f-d1aa-4385-8a53-e29025acd8af')
   */
  public addMember(uri: string): this {
    this.assertV4('addMember')
    this.setProperty({ element: 'member', key: 'MEMBER', value: uri })
    return this
  }

  /**
   * Add RELATED property (RFC 6350 §6.6.6).
   *
   * Specifies a relationship between the vCard entity and a other entity or person.
   * Multiple RELATED properties are permitted.
   *
   * @param options.value  A URI (e.g., `'mailto:friend@example.com'`) or free-form text name.
   * @param options.type   Optional relationship type(s) from RFC 6350 §6.6.6 (e.g., `'friend'`, `'colleague'`).
   * @throws VCardException When called on a vCard 3.0 instance.
   * @example
   * VCard.v4().addRelated({ value: 'mailto:alice@example.com', type: 'friend' })
   * VCard.v4().addRelated({ value: 'urn:uuid:...', type: 'spouse' })
   */
  public addRelated({ value, type }: RelatedOptions): this {
    this.assertV4('addRelated')
    const isUri = /^[a-zA-Z][a-zA-Z0-9+\-.]*:/.test(value)
    const serializedValue = isUri ? value : escapeText(value)
    let key = 'RELATED'
    if (isUri) key += ';VALUE=uri'
    if (type && type.length > 0) key += `;${resolveType(type, 4)}`
    this.setProperty({ element: 'related', key, value: serializedValue })
    return this
  }

  /**
   * Add CLIENTPIDMAP property (RFC 6350 §6.7.7).
   *
   * Maps a PID source to a URI for client/server synchronisation.
   * Multiple CLIENTPIDMAP properties are permitted.
   *
   * @param pid  A positive integer that acts as the PID source identifier.
   * @param uri  A URI identifying the client or data source.
   * @throws VCardException When called on a vCard 3.0 instance.
   * @example
   * VCard.v4().addClientPidMap(1, 'urn:uuid:3df403f4-5924-4bb7-b077-3c711d9eb34b')
   */
  public addClientPidMap(pid: number, uri: string): this {
    this.assertV4('addClientPidMap')
    if (!Number.isInteger(pid) || pid <= 0) {
      throw new VCardException('addClientPidMap pid must be a positive integer')
    }
    this.setProperty({
      element: 'clientPidMap',
      key: 'CLIENTPIDMAP',
      value: `${pid};${uri}`,
    })
    return this
  }

  /**
   * Add FBURL property (RFC 6350 §6.9.1).
   *
   * Specifies a URI for the subject's free/busy time data.
   * Multiple FBURL properties are permitted.
   *
   * @param url  A URI pointing to a free/busy calendar resource.
   * @throws VCardException When called on a vCard 3.0 instance.
   * @example
   * VCard.v4().addFbUrl('https://example.com/busy/ada')
   */
  public addFbUrl(url: string): this {
    this.assertV4('addFbUrl')
    this.setProperty({ element: 'fbUrl', key: 'FBURL', value: url })
    return this
  }

  /**
   * Add CALADRURI property (RFC 6350 §6.9.2).
   *
   * Specifies a URI for sending a scheduling request to the subject's calendar.
   * Multiple CALADRURI properties are permitted.
   *
   * @param uri  A URI (e.g., `'mailto:ada@example.com'` or a CalDAV scheduling URL).
   * @throws VCardException When called on a vCard 3.0 instance.
   * @example
   * VCard.v4().addCalAdrUri('mailto:ada@example.com')
   */
  public addCalAdrUri(uri: string): this {
    this.assertV4('addCalAdrUri')
    this.setProperty({ element: 'calAdrUri', key: 'CALADRURI', value: uri })
    return this
  }

  /**
   * Add CALURI property (RFC 6350 §6.9.3).
   *
   * Specifies a URI for accessing the subject's calendar.
   * Multiple CALURI properties are permitted.
   *
   * @param uri  A URI pointing to a calendar resource.
   * @throws VCardException When called on a vCard 3.0 instance.
   * @example
   * VCard.v4().addCalUri('https://example.com/cal/ada')
   */
  public addCalUri(uri: string): this {
    this.assertV4('addCalUri')
    this.setProperty({ element: 'calUri', key: 'CALURI', value: uri })
    return this
  }
}
