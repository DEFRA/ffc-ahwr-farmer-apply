const status = require('../constants/status')
const { hasSearchValue } = require('./checkForValue')
const { getValueWhereCondition } = require('./getValueFromObjectCondition')

//  10month = check offer is within 10months
const calculateMonths = (date, months) => {
  const resultantDate = new Date(date)
  resultantDate.setMonth(resultantDate.getMonth() + months)
  return resultantDate
}

const isWithinPeriodFromDate = (date, periodInMonths) => {
  if (!date || !(date instanceof Date)) {
    throw new Error('Invalid date provided')
  }
  const today = new Date()
  const targetDate = calculateMonths(date, periodInMonths)
  return today <= targetDate
}

const isOfferWithinTenMonths = (offerDate) => {
  if (!offerDate || !(offerDate instanceof Date)) {
    throw new Error(`Invalid date provided ${offerDate} `)
  }
  const periodInMonths = 10
  return isWithinPeriodFromDate(offerDate, periodInMonths)
}

// check all the conditions
const isUserOldWorldRejectWithinTenMonths = (applicationData) => {
  if (!applicationData || !Array.isArray(applicationData)) {
    throw new Error('Invalid application Data object')
  }
  if (applicationData.length < 2) {
    return { isValid: false, message: 'No old World aggreement' }
  }
  const dateOfClaim = getValueWhereCondition(
    applicationData,
    'statusId',
    10,
    'dateOfClaim'
  )

  const isExistingUser = hasSearchValue(applicationData, 'type', 'VV')
  const offerWithinTenMonths = isOfferWithinTenMonths(dateOfClaim)
  const isOfferRejected = hasSearchValue(
    applicationData,
    'statusId',
    status.REJECTED
  )
  const checks = [
    {
      check: isExistingUser,
      message: isExistingUser ? 'existing user' : 'new user'
    },
    {
      check: offerWithinTenMonths,
      message: offerWithinTenMonths
        ? 'Offer is within 10 months'
        : 'Offer is not within 10 months'
    },
    {
      check: isOfferRejected,
      message: isOfferRejected ? 'Offer is rejected' : 'Offer is not rejected'
    }
  ]

  console.log(`checks:  ${JSON.stringify(checks)}`)

  const failedChecks = checks
    .filter((item) => !item.check)
    .map((item) => item.message)

  if (failedChecks.length > 0) {
    return { isExistingUserRejectedAgreementWithin10months: false, message: failedChecks.join(', ') }
  }

  return { isExistingUserRejectedAgreementWithin10months: true }
}

module.exports = {
  calculateMonths,
  isWithinPeriodFromDate,
  isOfferWithinTenMonths,
  isUserOldWorldRejectWithinTenMonths
}
