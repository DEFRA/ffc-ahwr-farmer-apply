class DoesNotHaveAnyValidCph extends Error {
  constructor (message) {
    super(message)
    this.name = 'DoesNotHaveAnyValidCph'
  }
}

module.exports = DoesNotHaveAnyValidCph
