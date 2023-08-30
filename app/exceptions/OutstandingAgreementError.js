class OutstandingAgreementError extends Error {
  constructor (message, lastApplicationDate, nextApplicationDate) {
    super(message)
    this.name = 'OutstandingAgreementError'
    this.lastApplicationDate = lastApplicationDate
    this.nextApplicationDate = nextApplicationDate
  }
}

module.exports = OutstandingAgreementError
