const schema = require('./eligibility-api.config.schema')

const config = {
  uri: process.env.ELIGIBILITY_API_URI
}

const result = schema.validate(config, {
  abortEarly: false
})

if (result.error) {
  throw new Error(`The config is invalid: ${result.error.message}`)
}

module.exports = result.value
