const applicationApi = require('./application-api')
const status = require('../constants/status')
const { appliedBefore } = require('../constants/user-types')
const { OutstandingAgreementError, AlreadyAppliedError } = require('../exceptions')

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
    return appliedBefore.EXISTING_USER
  }

  if (latestApplication.statusId === status.AGREED && latestApplication.type === 'EE') {
    throw new AlreadyAppliedError(`Business with SBI ${latestApplication.data.organisation.sbi} already has an endemics agreement`)
  } else {
    throw new OutstandingAgreementError(`Business with SBI ${latestApplication.data.organisation.sbi} must claim or withdraw agreement before creating another.`)
  }
}

function getLatestApplication (latestApplicationsForSbi) {
  return latestApplicationsForSbi.reduce((a, b) => {
    return new Date(a.createdAt) > new Date(b.createdAt) ? a : b
  })
}

module.exports = businessAppliedBefore
