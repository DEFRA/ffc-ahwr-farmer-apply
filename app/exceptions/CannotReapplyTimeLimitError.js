class CannotReapplyTimeLimitError extends Error {
  // nextApplicationDate
  constructor (message, nextApplicationDate) {
    super(message)
    this.name = 'CannotReapplyTimeLimitError'
    this.nextApplicationDate = nextApplicationDate
  }
}

module.exports = CannotReapplyTimeLimitError
