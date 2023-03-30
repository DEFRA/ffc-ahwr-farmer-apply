const Wreck = require('@hapi/wreck')
const config = require('../../config').authConfig
const { buildRefreshFormData, buildAuthFormData } = require('./redeem-authorization-code-for-access-token')

const retrieveToken = async (request, refresh = false) => {
  console.log(`${new Date().toISOString()} Retrieving the access token: ${JSON.stringify({ refresh })}`)
  const data = refresh ? buildRefreshFormData(request) : buildAuthFormData(request)
  try {
    const response = await Wreck.post(
      `${config.defraId.hostname}/b2c_1a_signupsigninsfi/oauth2/v2.0/token`,
      {
        headers: data.getHeaders(),
        payload: data,
        json: true
      }
    )
    if (response.res.statusCode !== 200) {
      throw new Error(`HTTP ${response.res.statusCode} (${response.res.statusMessage})`)
    }
    return response.payload
  } catch (error) {
    console.log(`${new Date().toISOString()} Retrieving the access token failed: ${JSON.stringify({ refresh })}`)
    console.error(error)
    return undefined
  }
}

module.exports = retrieveToken
