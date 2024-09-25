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

  if (!offerDate) {
    const currentDate = Date.now()
    return isWithinPeriodFromDate(currentDate, periodInMonths)
  }
  return isWithinPeriodFromDate(offerDate, periodInMonths)
}

// check all the conditions
const isUserOldWorldRejectWithinTenMonths = (applicationData) => {
  const visitDate = getValueWhereCondition(applicationData, 'statusId', status.REJECTED, 'visitDate')

  const isExistingUser = hasSearchValue(applicationData, 'type', 'VV')
  const offerWithinTenMonths = isOfferWithinTenMonths(visitDate)
  const isOfferRejected = hasSearchValue(applicationData, 'statusId', status.REJECTED)
  const checks = [
    {
      isExistingUser
    },
    {
      offerWithinTenMonths
    },
    {
      isOfferRejected
    }
  ]

  const failedChecks = checks.filter((itemobj) => {
    return Object.values(itemobj).some(value => !value)
  })

  if (failedChecks.length > 0) {
    return {
      isExistingUserRejectedAgreementWithin10months: false
    }
  }

  return {
    isExistingUserRejectedAgreementWithin10months: true
  }
}

const isUserOldWorldReadyToPayWithinTenMonths = (applicationData) => {
  const visitDate = getValueWhereCondition(applicationData, 'statusId', status.READY_TO_PAY, 'visitDate')

  const isExistingUser = hasSearchValue(applicationData, 'type', 'VV')
  const offerWithinTenMonths = isOfferWithinTenMonths(visitDate)
  const isOfferReadyToPay = hasSearchValue(applicationData, 'statusId', status.READY_TO_PAY)

  const checks = [
    {
      isExistingUser
    },
    {
      offerWithinTenMonths
    },
    {
      isOfferReadyToPay
    }
  ]

  const failedChecks = checks.filter((itemobj) => {
    return Object.values(itemobj).some(value => !value)
  })

  if (failedChecks.length > 0) {
    return {
      isExistingUserRejectedAgreementWithin10months: false
    }
  }

  return {
    isExistingUserReadyToPayAgreementWithin10months: true
  }
}

module.exports = {
  calculateMonths,
  isWithinPeriodFromDate,
  isOfferWithinTenMonths,
  isUserOldWorldRejectWithinTenMonths,
  isUserOldWorldReadyToPayWithinTenMonths
}
