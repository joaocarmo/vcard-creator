import { PROPERTIES } from './properties'
import type { Element } from './types/VCard'

const elements = Object.keys(PROPERTIES) as Element[]

describe('PROPERTIES', () => {
  it('should allow repeats of the README repeatable properties only', () => {
    expect(elements.filter((element) => PROPERTIES[element].multiple)).toEqual([
      'address',
      'custom',
      'email',
      'impp',
      'key',
      'label',
      'logo',
      'nickname',
      'note',
      'phoneNumber',
      'photo',
      'social',
      'url',
    ])
  })

  it('should write the charset for the text properties except EMAIL, UID and TZ', () => {
    expect(elements.filter((element) => PROPERTIES[element].charset)).toEqual([
      'address',
      'categories',
      'company',
      'fullname',
      'jobtitle',
      'label',
      'name',
      'nickname',
      'note',
      'role',
      'sortString',
    ])
  })

  it.each(elements)('should give %s a non-empty error label', (element) => {
    expect(PROPERTIES[element].label).not.toBe('')
  })
})
