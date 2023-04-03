const { get } = require('./base')
const session = require('../../session')
const { tokens } = require('../../session/keys')
const config = require('../../config')
const jwtDecode = require('../../auth/token-verify/jwt-decode')
const hostname = config.authConfig.ruralPaymentsAgency.hostname
const getPersonSummaryUrl = config.authConfig.ruralPaymentsAgency.getPersonSummaryUrl

function getPersonName (personSummary) {
  return [personSummary.firstName, personSummary.middleName, personSummary.lastName].filter(Boolean).join(' ')
}

function parsedAccessToken (request) {
  const accessToken = session.getToken(request, tokens.accessToken)
  return jwtDecode(accessToken)
}

const getPersonSummary = async (request) => {
  const crn = parsedAccessToken(request).contactId
  const response = await get(hostname, getPersonSummaryUrl, request, { crn })
  return response._data
}

module.exports = {
  getPersonSummary,
  getPersonName
}
