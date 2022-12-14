const Wreck = require('@hapi/wreck')
const config = require('../config')

async function getEligibility (emailAddress) {
  try {
    const response = await Wreck.get(
      `${config.eligibilityApi.uri}/eligibility?emailAddress=${emailAddress}`,
      { json: true }
    )
    if (response.res.statusCode !== 200) {
      console.log(`Bad response: ${response.res.statusCode} - ${response.res.statusMessage}`)
      return null
    }
    return response.payload
  } catch (err) {
    console.error(`eligiblityApiUri.getEligibility failed: ${err.message}`)
    return null
  }
}

module.exports = {
  getEligibility
}
