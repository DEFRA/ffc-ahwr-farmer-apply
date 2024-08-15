const { getPersonSummary, getPersonName } = require('./person')
const { organisationIsEligible, getOrganisationAddress } = require('./organisation')
const cphCheck = require('./cph-check')
const { getExistingUserData } = require('./getExistingUserData')

module.exports = {
  getPersonSummary,
  getPersonName,
  organisationIsEligible,
  getOrganisationAddress,
  cphCheck,
  getExistingUserData
}
