const { get } = require('./base')
const session = require('../../session')
const { tokens } = require('../../session/keys')
const config = require('../../config')
const decodeJwt = require('../../auth/access-token/jwt/decode-jwt')
const hostname = config.authConfig.ruralPaymentsAgency.hostname
const getPersonSummaryUrl = config.authConfig.ruralPaymentsAgency.getPersonSummaryUrl

function getPersonName (personSummary) {
  const fFirstName = personSummary.firstName != null ? personSummary.firstName : ''
  const middleName = personSummary.middleName != null ? personSummary.middleName : ''
  const lastName = personSummary.lastName != null ? personSummary.lastName : ''
  return fFirstName.concat(' ', middleName, ' ', lastName).trim().replaceAll(/ +/g, ' ')
}

function parsedAccessToken (request) {
  const accessToken = session.getToken(request, tokens.accessToken)
  return decodeJwt(accessToken)
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
