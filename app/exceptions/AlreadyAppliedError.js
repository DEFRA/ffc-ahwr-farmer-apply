// TODO: remove this error when 10 month rule toggle is removed
class AlreadyAppliedError extends Error {
  constructor (message) {
    super(message)
    this.name = 'AlreadyAppliedError'
  }
}

module.exports = AlreadyAppliedError
