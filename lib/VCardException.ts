class VCardException extends Error {
  constructor(params: string | undefined) {
    // Pass remaining arguments to the parent constructor
    super(params)

    // Maintains a proper stack trace where our error was thrown
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, VCardException)
    }

    this.name = 'VCardException'
  }
}

export default VCardException
