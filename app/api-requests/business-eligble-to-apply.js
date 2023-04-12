const applicationApi = require('./application-api')
const status = require('../constants/status')
const validStatusForApplication = [status.NOT_AGREED, status.WITHDRAWN]

async function businessEligibleToApply (sbi) {
  const latestApplicationsForSbi = await applicationApi.getLatestApplicationsBySbi(sbi)
  if (latestApplicationsForSbi && Array.isArray(latestApplicationsForSbi)) {
    const businessIsEligble = latestApplicationsForSbi.length === 0 ? true : applicationForBusinessInStateToApply(getLatestApplication(latestApplicationsForSbi))
    return businessIsEligble
  } else {
    return false
  }
}

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

function getLatestApplication (latestApplicationsForSbi) {
  return latestApplicationsForSbi.reduce((a, b) => {
    return new Date(a.updatedAt) > new Date(b.updatedAt) ? a : b
  })
}

module.exports = businessEligibleToApply
