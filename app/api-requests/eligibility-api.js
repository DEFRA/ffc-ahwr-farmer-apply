const Joi = require('joi')
const Wreck = require('@hapi/wreck')
const config = require('../config')
const businessSchema = require('./business.schema')

async function getEligibility (emailAddress) {
  try {
    const response = await Wreck.get(
      `${config.eligibilityApi.uri}/eligibility?emailAddress=${emailAddress}`,
      { json: true }
    )
    if (response.res.statusCode !== 200) {
      throw new Error(`HTTP ${response.res.statusCode} (${response.res.statusMessage})`)
    }
    const payload = businessSchema.validate(response.payload)
    if (payload.error) {
      throw new Error(JSON.stringify(payload.error))
    }
    return payload.value
  } catch (err) {
    console.error(`Get eligibility failed: ${err.message}`)
    return null
  }
}

async function getBusinesses (businessEmail) {
  console.log(`${new Date().toISOString()} Getting businesses: ${JSON.stringify({ businessEmail })}`)
  try {
    const response = await Wreck.get(
      `${config.eligibilityApi.uri}/businesses?emailAddress=${businessEmail}`,
      { json: true }
    )
    if (response.res.statusCode !== 200) {
      throw new Error(`HTTP ${response.res.statusCode} (${response.res.statusMessage})`)
    }
    const payload = Joi.array().items(businessSchema).validate(response.payload)
    if (payload.error) {
      throw new Error(JSON.stringify(payload.error))
    }
    return payload.value
  } catch (error) {
    console.error(`${new Date().toISOString()} Getting businesses failed: ${JSON.stringify({ businessEmail })}`, error)
    return null
  }
}

module.exports = {
  getEligibility,
  getBusinesses
}
