import VCardException from './VCardException'

describe('VCardException', () => {
  it('should set the name and message', () => {
    const error = new VCardException('Invalid value')
    expect(error.name).toBe('VCardException')
    expect(error.message).toBe('Invalid value')
  })

  it('should be an instance of Error and VCardException', () => {
    const error = new VCardException('Invalid value')
    expect(error).toBeInstanceOf(Error)
    expect(error).toBeInstanceOf(VCardException)
  })
})
