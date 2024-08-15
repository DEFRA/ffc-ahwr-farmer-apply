const wreck = require('@hapi/wreck')
const config = require('../../config')

const getExistingUserData = async (crn) => {
  try {
    const response = await wreck.get(`${config.authConfig.ruralPaymentsAgency.applicationApiUri}/application/${crn}`, { json: true })
    const result = response?.payload

    if (response.res.statusCode !== 200) {
      throw new Error(`HTTP ${response.res.statusCode} (${response.res.statusMessage})`)
    }

    return result
  } catch (error) {
    console.error(`${new Date().toISOString()} Getting applications for a farmer with the crn ${JSON.stringify(crn)} failed with the error: ${error}`)
    return null
  }
}

module.exports = {
  getExistingUserData
}
