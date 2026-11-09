import DefaultExport, { VCard as NamedVCard, VCardException } from './index'
import VCard from './VCard'
import VCardExceptionClass from './VCardException'

describe('index', () => {
  it('should export VCard as the default and a named export', () => {
    expect(DefaultExport).toBe(VCard)
    expect(NamedVCard).toBe(VCard)
  })

  it('should export VCardException as a named export', () => {
    expect(VCardException).toBe(VCardExceptionClass)
  })
})
