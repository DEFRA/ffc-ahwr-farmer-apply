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
    return []
  }
}

async function getEligibleBusinesses (businessEmail) {
  console.log(`${new Date().toISOString()} Getting eligible businesses: ${JSON.stringify({ businessEmail })}`)
  try {
    const response = await Wreck.get(
      `${config.eligibilityApi.uri}/businesses?emailAddress=${businessEmail}`,
      { json: true }
    )
    if (response.res.statusCode !== 200 && response.res.statusCode !== 302) {
      throw new Error(`HTTP ${response.res.statusCode} (${response.res.statusMessage})`)
    }
    const payload = Joi.array().items(businessSchema).validate(response.payload)
    if (payload.error) {
      throw new Error(JSON.stringify(payload.error))
    }
    console.log(`${new Date().toISOString()} Eligible Businesses: ${JSON.stringify(payload.value.map(({ sbi, email }) => ({ sbi, email })))}`)
    return payload.value
  } catch (error) {
    console.error(`${new Date().toISOString()} Getting eligible businesses failed: ${JSON.stringify({
      businessEmail
    })}`, error)
    return []
  }
}

module.exports = {
  getEligibility,
  getEligibleBusinesses
}
