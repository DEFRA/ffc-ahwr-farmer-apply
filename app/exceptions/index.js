const InvalidPermissionsError = require('./InvalidPermissionsError')
const AlreadyAppliedError = require('./AlreadyAppliedError')
const InvalidStateError = require('./InvalidStateError')
const NoEligibleCphError = require('./NoEligibleCphError')
const CannotApplyBeforeTenMonthsError = require('./CannotApplyBeforeTenMonthsError')
const OutstandingAgreementError = require('./OutstandingAgreementError')

module.exports = {
  InvalidPermissionsError,
  AlreadyAppliedError,
  InvalidStateError,
  NoEligibleCphError,
  CannotApplyBeforeTenMonthsError,
  OutstandingAgreementError
}
