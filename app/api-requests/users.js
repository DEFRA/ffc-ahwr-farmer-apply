const config = require('../config')
const usersFile = require('./users-file')
const eligibilityApi = require('./eligibility-api')

async function getByEmailAndSbi (emailAddress, sbi) {
  if (config.eligibilityApi.enabled) {
    return await eligibilityApi.getEligibility(emailAddress.toLowerCase(), sbi)
  } else {
    return (await usersFile.getUsers()).find(x => x.email.toLowerCase() === emailAddress.toLowerCase())
  }
}

module.exports = {
  getByEmailAndSbi: getByEmailAndSbi
}
