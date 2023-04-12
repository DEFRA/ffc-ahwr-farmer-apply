class AlreadyAppliedError extends Error {
  constructor (message) {
    super(message)
    this.name = 'AlreadyAppliedError'
  }
}

module.exports = AlreadyAppliedError
