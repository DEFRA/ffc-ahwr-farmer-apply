const { get } = require('./base')
const session = require('../../session')
const sessionKeys = require('../../session/keys')
const config = require('../../config')

const getCphNumbers = async (request, apimAccessToken) => {
  const response = await get(
    config.authConfig.ruralPaymentsAgency.hostname,
    config.authConfig.ruralPaymentsAgency.getCphNumbersUrl.replace(
      'organisationId',
      session.getCustomer(request, sessionKeys.customer.organisationId)
    ),
    request,
    {
      crn: session.getCustomer(request, sessionKeys.customer.crn),
      Authorization: apimAccessToken
    }
  )
  if (!response.success) {
    throw new Error(response.errorString)
  }
  return response.data.map(cph => cph.cphNumber)
}

module.exports = getCphNumbers
