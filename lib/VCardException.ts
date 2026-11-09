class VCardException extends Error {
  constructor(params: string) {
    super(params)

    this.name = 'VCardException'
  }
}

export default VCardException
