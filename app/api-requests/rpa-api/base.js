const wreck = require('@hapi/wreck')
const session = require('../../session')
const { tokens } = require('../../session/keys')
const config = require('../../config')

const get = async (hostname, url, request, headers = {}) => {
  const token = session.getToken(request, tokens.accessToken)
  headers['X-Forwarded-Authorization'] = token
  headers['Ocp-Apim-Subscription-Key'] = config.authConfig.ruralPaymentsAgency.ocpApimSubscriptionKey
  console.log(`${new Date().toISOString()} Request message to RPA: ${JSON.stringify(`${hostname}${url}`)}`)

  try {
    const response = await wreck.get(`${hostname}${url}`,
      {
        headers,
        json: true,
        rejectUnauthorized: false
      })

    console.log(`${new Date().toISOString()} Response status code from RPA: ${JSON.stringify(response.res.statusCode)}`)
    return response?.payload
  } catch (error) {
    console.log(`${new Date().toISOString()} Response message from RPA: ${JSON.stringify(error.message)}`)
    console.error(error)
    throw error
  }
}

module.exports = {
  get
}
