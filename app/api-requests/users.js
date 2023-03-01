const eligibilityApi = require('./eligibility-api')

async function getByEmail (emailAddress) {
  return await eligibilityApi.getEligibility(emailAddress.toLowerCase())
}

module.exports = {
  getByEmail
}
