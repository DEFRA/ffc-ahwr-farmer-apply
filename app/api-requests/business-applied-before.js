const applicationApi = require('./application-api')
const status = require('../constants/status')
const { userType } = require('../constants/user-types')
const applicationType = require('../constants/application-type')

async function businessAppliedBefore (sbi) {
  const latestApplicationsForSbi = await applicationApi.getLatestApplicationsBySbi(sbi)
  if (latestApplicationsForSbi && Array.isArray(latestApplicationsForSbi)) {
    return applicationForBusinessInStateToApply(latestApplicationsForSbi)
  } else {
    throw new Error('Bad response from API')
  }
}

const isWithin10Months = (d) => {
  const date = new Date(d)
  const datePlus10Months = date.setMonth(date.getMonth() + 10)
  return datePlus10Months >= new Date()
}

function applicationForBusinessInStateToApply (latestApplicationsForSbi) {
  if (latestApplicationsForSbi.filter(application => application.type === applicationType.VET_VISITS).length === 0) {
    return userType.NEW_USER
  }

  const latestApplication = getLatestApplication(latestApplicationsForSbi)

  const latestApplicationWithinLastTenMonths = isWithin10Months(latestApplication.data.visitDate)

  if ([status.WITHDRAWN, status.REJECTED, status.NOT_AGREED].includes(latestApplication.statusId) || !latestApplicationWithinLastTenMonths) {
    return userType.NEW_USER
  } else {
    return userType.EXISTING_USER
  }
}

function getLatestApplication (latestApplicationsForSbi) {
  return latestApplicationsForSbi.reduce((a, b) => {
    return new Date(a.createdAt) > new Date(b.createdAt) ? a : b
  })
}

module.exports = businessAppliedBefore
