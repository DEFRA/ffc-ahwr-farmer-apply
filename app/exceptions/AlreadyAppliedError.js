export class AlreadyAppliedError extends Error {
  constructor (message) {
    super(message)
    this.name = 'AlreadyAppliedError'
  }
}
