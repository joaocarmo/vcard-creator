class VCardException extends Error {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(...params: any[]) {
    // Pass remaining arguments to the parent constructor
    super(...params)

    // Maintains a proper stack trace where our error was thrown
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, VCardException)
    }

    this.name = 'VCardException'
  }
}

export default VCardException
