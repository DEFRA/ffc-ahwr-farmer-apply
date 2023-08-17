class CannotApplyBeforeTenMonthsError extends Error {
  nextApplicationDate 
  constructor (message, nextApplicationDate) {
    super(message)
    this.name = 'CannotApplyBeforeTenMonthsError'
    this.nextApplicationDate = nextApplicationDate
  }
}

module.exports = CannotApplyBeforeTenMonthsError
