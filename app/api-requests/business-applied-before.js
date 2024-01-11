const applicationApi = require('./application-api')
const status = require('../constants/status')
const { appliedBefore } = require('../constants/user-types')

async function businessAppliedBefore (sbi) {
  const latestApplicationsForSbi = await applicationApi.getLatestApplicationsBySbi(sbi)
  if (latestApplicationsForSbi && Array.isArray(latestApplicationsForSbi)) {
    return applicationForBusinessInStateToApply(latestApplicationsForSbi)
  } else {
    throw new Error('Bad response from API')
  }
}

function applicationForBusinessInStateToApply (latestApplicationsForSbi) {
  if (latestApplicationsForSbi.length === 0) {
    return appliedBefore.NEW_USER
  }
  const latestApplication = getLatestApplication(latestApplicationsForSbi)

  const closedApplicationStatuses = [status.WITHDRAWN, status.REJECTED, status.NOT_AGREED, status.READY_TO_PAY]
  if (closedApplicationStatuses.includes(latestApplication.statusId)) {
    return appliedBefore.CLOSED_APPLICATION
  }

  return appliedBefore.OPEN_APPLICATION
}

function getLatestApplication (latestApplicationsForSbi) {
  return latestApplicationsForSbi.reduce((a, b) => {
    return new Date(a.createdAt) > new Date(b.createdAt) ? a : b
  })
}

module.exports = businessAppliedBefore
