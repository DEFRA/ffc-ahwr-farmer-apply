class NoEligibleCphError extends Error {
  constructor (message) {
    super(message)
    this.name = 'NoEligibleCphError'
  }
}

module.exports = NoEligibleCphError
