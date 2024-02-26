const applicationApi = require('./application-api')
const config = require('../config')
const status = require('../constants/status')
const applicationType = require('../constants/application-type')
const validStatusForApplication = [status.NOT_AGREED, status.WITHDRAWN]
const closedApplicationStatuses = [status.WITHDRAWN, status.REJECTED, status.NOT_AGREED, status.READY_TO_PAY]
const { CannotReapplyTimeLimitError, OutstandingAgreementError, AlreadyAppliedError } = require('../exceptions')

async function businessEligibleToApply (sbi) {
  const latestApplicationsForSbi = await applicationApi.getLatestApplicationsBySbi(sbi)
  if (latestApplicationsForSbi && Array.isArray(latestApplicationsForSbi)) {
    applicationForBusinessInStateToApply(latestApplicationsForSbi)
  } else {
    throw new Error('Bad response from API')
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
        sbi: latestApplication.data.organisation.sbi
      })}`)
  } else if (config.endemics.enabled) {
    if (latestApplication.statusId === status.AGREED && latestApplication.type === applicationType.ENDEMICS) {
      throw new AlreadyAppliedError(`Business with SBI ${latestApplication.data.organisation.sbi} already has an endemics agreement`)
    } else if (!closedApplicationStatuses.includes(latestApplication.statusId)) {
      // Open agreement on the old system must be closed
      throw new OutstandingAgreementError(`Business with SBI ${latestApplication.data.organisation.sbi} must claim or withdraw agreement before creating another.`)
    }
  } else if (config.tenMonthRule.enabled) {
    const dates = timeLimitDates(latestApplication)
    const { startDate, endDate } = dates
    if (latestApplication.statusId === status.AGREED) {
      // if agreement is still AGREED customer must claim or withdraw
      throw new OutstandingAgreementError(`Business with SBI ${latestApplication.data.organisation.sbi} must claim or withdraw agreement before creating another.`, formatDate(startDate), formatDate(endDate))
    } else {
      // for any other status check 10 month rule
      timeLimitRule(latestApplication, dates)
    }
  } else {
    // when toggle is off
    throw new AlreadyAppliedError(`Business with SBI ${latestApplication.data.organisation.sbi} is not eligible to apply`)
  }
}

function formatDate (date) {
  return date.toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' })
}

function timeLimitDates (latestApplication) {
  const start = new Date(latestApplication.createdAt)
  const end = new Date(start)
  end.setMonth(end.getMonth() + config.reapplyTimeLimitMonths)
  end.setHours(23, 59, 59, 999) // set to midnight of agreement end day
  return { startDate: start, endDate: end }
}

function timeLimitRule (latestApplication, dates) {
  const { startDate, endDate } = dates
  // Set re-application date to day after current application ends
  const nextApplicationDate = new Date(endDate.setDate(endDate.getDate() + 1))
  console.log(`Checking if agreement with reference ${latestApplication.reference}, start date of ${startDate} and end date of ${endDate} has exceeded the application reapply wait time of ${config.reapplyTimeLimitMonths} months.`)
  if (Date.now() <= endDate) {
    console.log(`${new Date().toISOString()} Business is not eligible to apply due to ${config.reapplyTimeLimitMonths} month restrictions: ${JSON.stringify({
      sbi: latestApplication.data.organisation.sbi
    })}`)
    throw new CannotReapplyTimeLimitError(`Business with SBI ${latestApplication.data.organisation.sbi} is not eligible to apply due to ${config.reapplyTimeLimitMonths} month restrictions since the last agreement.`, formatDate(startDate), formatDate(nextApplicationDate))
  }
}

function getLatestApplication (latestApplicationsForSbi) {
  return latestApplicationsForSbi.reduce((a, b) => {
    return new Date(a.createdAt) > new Date(b.createdAt) ? a : b
  })
}

module.exports = businessEligibleToApply
