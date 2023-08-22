class CannotReapplyTimeLimitError extends Error {
  constructor (message, lastApplicationDate, nextApplicationDate) {
    super(message)
    this.name = 'CannotReapplyTimeLimitError'
    this.lastApplicationDate = lastApplicationDate
    this.nextApplicationDate = nextApplicationDate
  }
}

module.exports = CannotReapplyTimeLimitError
