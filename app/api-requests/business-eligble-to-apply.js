const applicationApi = require('./application-api')
const config = require('../config')
const status = require('../constants/status')
const { TenMonthEligibleApplicationError } = require('../exceptions')
// const validStatusForApplication = config.tenMonthRule.enabled === true ? [status.WITHDRAWN] : [status.NOT_AGREED, status.WITHDRAWN]
const validStatusForApplication = [status.NOT_AGREED, status.WITHDRAWN]

async function businessEligibleToApply (sbi) {
  const latestApplicationsForSbi = await applicationApi.getLatestApplicationsBySbi(sbi)
  if (latestApplicationsForSbi && Array.isArray(latestApplicationsForSbi)) {
    const businessIsEligible = latestApplicationsForSbi.length === 0 ? true : applicationForBusinessInStateToApply(getLatestApplication(latestApplicationsForSbi))
    return businessIsEligible
  } else {
    return false
  }
}

async function businessEligibleToApplyWithDate (sbi) {
  const latestApplicationsForSbi = await applicationApi.getLatestApplicationsBySbi(sbi)
  let businessIsEligible
  let dateCanReapply
  if (latestApplicationsForSbi && Array.isArray(latestApplicationsForSbi)) {
    const latestApplication = getLatestApplication(latestApplicationsForSbi)
    // This logic to be expanded...
    businessIsEligible = applicationPastReapplyTimeLimit(latestApplication) && applicationForBusinessInStateToApply(latestApplication)
    dateCanReapply = applicationPastReapplyTimeLimit(latestApplication) ? calcReapplicationDate(latestApplication) : new Date()
  } 
  
  if(!businessIsEligible)
  {
    throw new TenMonthEligibleApplicationError('Blah Blah 10 month error',businessIsEligible, dateCanReapply )
  }
}

// Need to update and / or add log about date
function applicationForBusinessInStateToApply (latestApplication) {
  if (validStatusForApplication.includes(latestApplication.statusId)) {
    console.log(`${new Date().toISOString()} Business is eligible to apply : ${JSON.stringify({
        sbi: latestApplication.sbi
      })}`)
    return true
  } else {
    console.log(`${new Date().toISOString()} Business is not eligible to apply : ${JSON.stringify({
        sbi: latestApplication.sbi
    })}`)
    return false
  }
}

function applicationPastReapplyTimeLimit (application) {
  const startDate = new Date(application.createdAt)
  const endDate = new Date(startDate)
  endDate.setMonth(endDate.getMonth() + config.reapplyTimeLimitMonths)
  endDate.setHours(24, 0, 0, 0) // set to midnight of agreement end day
  console.log(`Checking if agreement with reference ${application.reference}, start date of ${startDate} and end date of ${endDate} has exceeded the application reapply wait time of ${config.reapplyTimeLimitMonths} months.`)
  return Date.now() > endDate
}

function calcReapplicationDate (application) {
  const startDate = new Date(application.createdAt)
  const endDate = new Date(startDate)
  endDate.setMonth(endDate.getMonth() + config.reapplyTimeLimitMonths)
  endDate.setHours(24, 0, 0, 0) // set to midnight of agreement end day
  console.log(`Checking if agreement with reference ${application.reference}, start date of ${startDate} and end date of ${endDate} has exceeded the application reapply wait time of ${config.reapplyTimeLimitMonths} months.`)
  const currentDate = Date.now()
  if (currentDate > endDate) {
    return endDate
  }
}

function getLatestApplication (latestApplicationsForSbi) {
  return latestApplicationsForSbi.reduce((a, b) => {
    return new Date(a.updatedAt) > new Date(b.updatedAt) ? a : b
  })
}

module.exports = {
  businessEligibleToApply,
  businessEligibleToApplyWithDate
}
