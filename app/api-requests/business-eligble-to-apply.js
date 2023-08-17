const applicationApi = require('./application-api')
const status = require('../constants/status')
const validStatusForApplication = [status.NOT_AGREED, status.WITHDRAWN]
const { CannotApplyBeforeTenMonthsError, OutstandingAgreementError } = require('../exceptions')
const tenMonthRuleFeature = require('../config').tenMonthRule

async function businessEligibleToApply (sbi) {
  const latestApplicationsForSbi = await applicationApi.getLatestApplicationsBySbi(sbi)
  if (latestApplicationsForSbi && Array.isArray(latestApplicationsForSbi)) {
    applicationForBusinessInStateToApply(latestApplicationsForSbi)
  } else {
    throw new Error("Bad response from API")
  }
}

function applicationForBusinessInStateToApply (latestApplicationsForSbi) {
  if (latestApplicationsForSbi.length === 0) {
    // no existing applications so continue
    return
  }
  const latestApplication = getLatestApplication(latestApplicationsForSbi)
  if (validStatusForApplication.includes(latestApplication.statusId)) {
    // latest application is either WITHDRAWN or NOT_AGREED so okay to continue
    console.log(`${new Date().toISOString()} Business is eligible to apply : ${JSON.stringify({
        sbi: latestApplication.sbi
      })}`)
  } else if (latestApplication.statusId === status.AGREED) {
    // if agreement is still AGREED customer must claim or withdraw
    throw new OutstandingAgreementError('Customer must claim or withdraw agreement before creating another.')
  } else {
    // for any other status check 10 month rule
    tenMonthRule(latestApplication)
  }
}

function getLatestApplication (latestApplicationsForSbi) {
  return latestApplicationsForSbi.reduce((a, b) => {
    return new Date(a.updatedAt) > new Date(b.updatedAt) ? a : b
  })
}

// can easily abstract to a new function file so it can be easily tested
function tenMonthRule(latestApplication) {
  if (tenMonthRuleFeature.enabled) {
    const startDate = new Date(latestApplication.createdAt)
    const endDate = new Date(startDate)
    endDate.setMonth(endDate.getMonth() + 10)
    endDate.setHours(24, 0, 0, 0) // set to midnight of agreement end day
    console.log(`Checking if agreement with reference ${latestApplication.reference}, start date of ${startDate} and end date of ${endDate} has exceeded the application reapply wait time of 10 months.`)
    if (Date.now() < endDate) {
      console.log(`${new Date().toISOString()} Business is not eligible to apply due to 10 month restrictions: ${JSON.stringify({
        sbi: latestApplication.sbi
      })}`)
      throw new CannotApplyBeforeTenMonthsError('Business is not eligible to apply due to 10 month restrictions since the last agreement.', endDate)
    }
  }
}

module.exports = businessEligibleToApply
