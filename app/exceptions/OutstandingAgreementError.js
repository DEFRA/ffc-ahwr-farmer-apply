class OustandingAgreementError extends Error {
  constructor (message) {
    super(message)
    this.name = 'OustandingAgreementError'
  }
}

module.exports = OustandingAgreementError
