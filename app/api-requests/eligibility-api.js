const Wreck = require('@hapi/wreck')
const config = require('../config')
const userSchema = require('./user.schema')
const Joi = require('joi')

async function getEligibility (emailAddress) {
  try {
    const response = await Wreck.get(
      `${config.eligibilityApi.uri}/eligibility?emailAddress=${emailAddress}`,
      { json: true }
    )
    if (response.res.statusCode !== 200) {
      throw new Error(`HTTP ${response.res.statusCode} (${response.res.statusMessage})`)
    }
    const payload = userSchema.validate(response.payload)
    if (payload.error) {
      throw new Error(JSON.stringify(payload.error))
    }
    return payload.value
  } catch (err) {
    console.error(`Get eligibility failed: ${err.message}`)
    return null
  }
}

async function getEligibleBusiness (emailAddress) {
  try {
    const response = await Wreck.get(
      `${config.eligibilityApi.uri}/users?emailAddress=${emailAddress}`,
      { json: true }
    )
    if (response.res.statusCode !== 200) {
      throw new Error(`HTTP ${response.res.statusCode} (${response.res.statusMessage})`)
    }
    const userArraySchema = Joi.array().items(userSchema)
    const payload = userArraySchema.validate(response.payload)
    if (payload.error) {
      throw new Error(JSON.stringify(payload.error))
    }
    return payload.value
  } catch (err) {
    console.error(`Get eligible business failed: ${err.message}`)
    return null
  }
}
module.exports = {
  getEligibility,
  getEligibleBusiness
}
