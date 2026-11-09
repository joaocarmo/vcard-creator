class VCardException extends Error {
  constructor(params: string) {
    // Pass remaining arguments to the parent constructor
    super(params)

    this.name = 'VCardException'
  }
}

export default VCardException
