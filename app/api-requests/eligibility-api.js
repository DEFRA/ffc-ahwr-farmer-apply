const Wreck = require('@hapi/wreck')
const config = require('../config')

async function checkWaitingList (businessEmail) {
  console.log(`${new Date().toISOString()} Checking waiting list for : ${JSON.stringify({ businessEmail })}`)
  const response = await Wreck.get(
      `${config.eligibilityApi.uri}/waiting-list?emailAddress=${businessEmail}`,
      { json: true }
  )
  if (!response || response.res.statusCode !== 200) {
    throw new Error(`HTTP ${response?.res.statusCode} (${response?.res.statusMessage})`)
  }
  console.log(`${new Date().toISOString()} waiting list API returned: ${JSON.stringify(response.payload)}`)
  return response.payload
}

module.exports = {
  checkWaitingList
}
