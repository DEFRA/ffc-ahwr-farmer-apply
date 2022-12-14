const Joi = require('joi')

const schema = Joi.object({
  eligibilityApi: {
    uri: Joi.string().uri().default('http://host.docker.internal:3010/api'),
    enabled: Joi.bool().default(true)
  }
})

const config = {
  eligibilityApi: {
    uri: process.env.ELIGIBILITY_API_URI,
    enabled: process.env.ELIGIBILITY_API_ENABLED
  }
}

const result = schema.validate(config, {
  abortEarly: false
})

if (result.error) {
  throw new Error(`The eligibility API config is invalid: ${result.error.message}`)
}

const value = result.value

module.exports = value
