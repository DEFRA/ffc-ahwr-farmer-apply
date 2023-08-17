class TenMonthEligibleApplicationError extends Error {
    businessEligible = false
    tenMonthEligibleDate = null //Nullable Date
    constructor (message, businessEligible, tenMonthEligibleDate) {
      super(message)
      this.name = 'TenMonthEligibleApplicationError'
    }
  }
  
  module.exports = TenMonthEligibleApplicationError