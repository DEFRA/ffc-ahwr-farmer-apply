const { getPersonSummary, getPersonName } = require('./person')
const { organisationIsEligible, getOrganisationAddress } = require('./organisation')
const getCphNumbers = require('./cph-numbers')
const cphCheck = require('./cph-check')

module.exports = {
  getPersonSummary,
  getPersonName,
  organisationIsEligible,
  getOrganisationAddress,
  getCphNumbers,
  cphCheck
}
