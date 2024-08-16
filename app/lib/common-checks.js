const status = require('../constants/status')
const { hasSearchValue } = require('./checkForValue')
const { getValueWhereCondition } = require('./getValueFromObjectCondition')

//  10month = check offer is within 10months
const calculateMonths = (date, months) => {
  const resultantDate = new Date(date)
  const resDate = resultantDate.setMonth(resultantDate.getMonth() + months)
  return resDate
}

const isWithinPeriodFromDate = (date, periodInMonths) => {
  const today = new Date()
  const targetDate = calculateMonths(date, periodInMonths)
  return today <= targetDate
}

const isOfferWithinTenMonths = (offerDate) => {
  const periodInMonths = 10

  if(!offerDate){
    const currentDate = Date.now()
    return isWithinPeriodFromDate(currentDate, periodInMonths)
  }
  return isWithinPeriodFromDate(offerDate, periodInMonths)
}

// check all the conditions
const isUserOldWorldRejectWithinTenMonths = (applicationData) => {
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

  const failedChecks = checks
    .filter((item) => !item.check)
    .map((item) => item.message)

  if (failedChecks.length > 0) {
    return {
      isExistingUserRejectedAgreementWithin10months: false,
      message: failedChecks.join(', ')
    }
  }

  return {
    isExistingUserRejectedAgreementWithin10months: true,
    message: 'existingUser, rejected agreement within 10months'
  }
}

module.exports = {
  calculateMonths,
  isWithinPeriodFromDate,
  isOfferWithinTenMonths,
  isUserOldWorldRejectWithinTenMonths
}
