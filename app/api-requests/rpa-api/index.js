const { getPersonSummary, getPersonName } = require('./person')
const {
  organisationIsEligible,
  getOrganisationAddress
} = require('./organisation')
const cphCheck = require('./cph-check')
const { getExistingUserData } = require('./get-existing-user-Data')

module.exports = {
  getPersonSummary,
  getPersonName,
  organisationIsEligible,
  getOrganisationAddress,
  cphCheck,
  getExistingUserData
}
