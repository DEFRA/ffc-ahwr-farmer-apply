const Wreck = require('@hapi/wreck')
const config = require('../config')

async function getLatestApplicationsBy (businessEmail) {
  console.log(`${new Date().toISOString()} Getting latest applications by: ${JSON.stringify({ businessEmail })}`)
  try {
    const response = await Wreck.get(
      `${config.applicationApi.uri}/applications/latest?businessEmail=${businessEmail}`,
      { json: true }
    )
    if (response.res.statusCode !== 200 && response.res.statusCode !== 302) {
      throw new Error(`HTTP ${response.res.statusCode} (${response.res.statusMessage})`)
    }
    console.log(`${new Date().toISOString()} Latest Applications: ${JSON.stringify(response.payload.map(({ id, reference, data: { organisation: { sbi, email } }, statusId }) => ({ id, reference, data: { organisation: { sbi, email } }, statusId })))}`)
    return response.payload
  } catch (error) {
    console.error(`${new Date().toISOString()} Getting latest applications failed: ${JSON.stringify({
      businessEmail
    })}`, error)
    return null
  }
}

module.exports = {
  getLatestApplicationsBy
}
