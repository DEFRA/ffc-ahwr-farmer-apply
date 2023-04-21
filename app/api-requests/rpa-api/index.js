const { getPersonSummary, getPersonName } = require('./person')
const { organisationIsEligible, getOrganisationAddress } = require('./organisation')
const getCphNumbers = require('./cph-numbers')
const cphCheck = require('./cph-check')
const DoesNotHaveAnyValidCph = require('./does-not-have-any-valid-cph')

module.exports = {
  getPersonSummary,
  getPersonName,
  organisationIsEligible,
  getOrganisationAddress,
  getCphNumbers,
  cphCheck,
  DoesNotHaveAnyValidCph
}
