class VCardException extends Error {
  constructor(message: string) {
    super(message)

    this.name = 'VCardException'
  }
}

export default VCardException
