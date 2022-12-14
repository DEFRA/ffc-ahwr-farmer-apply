const config = require('../config')
const usersFile = require('./users-file')
const eligibilityApi = require('./eligibility-api')

async function getByEmail (emailAddress) {
  if (config.eligibilityApi.enabled) {
    return await eligibilityApi.getEligibility(emailAddress.toLowerCase())
  } else {
    return (await usersFile.getUsers()).find(x => x.email.toLowerCase() === emailAddress.toLowerCase())
  }
}

module.exports = {
  getByEmail
}
