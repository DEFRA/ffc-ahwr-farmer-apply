const applicationApi = require('./application-api')
const WITHDRAWN = 2
const NOT_AGREED = 7

async function businessEligibleToApply (sbi) {
  const latestApplicationsForSbi = await applicationApi.getLatestApplicationsBySbi(sbi)
  console.log(`Result is ${JSON.stringify(latestApplicationsForSbi)}`)
  if (latestApplicationsForSbi && Array.isArray(latestApplicationsForSbi) && latestApplicationsForSbi.length === 0) {
    // no existing applications found
    return true
  } else if (latestApplicationsForSbi && Array.isArray(latestApplicationsForSbi) && latestApplicationsForSbi.length > 0) {
    const latestApplication = latestApplicationsForSbi.reduce((a, b) => {
      return new Date(a.updatedAt) > new Date(b.updatedAt) ? a : b
    })
    return existingApplicationForBusinessCanReApply(latestApplication)
  } else {
    return false
  }
}

function existingApplicationForBusinessCanReApply (latestApplication) {
  if (latestApplication.statusId === WITHDRAWN || latestApplication.statusId === NOT_AGREED) {
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

module.exports = businessEligibleToApply
