const Joi = require('joi')

const schema = Joi.object({
  uri: Joi.string().uri().default('http://host.docker.internal:3010/api'),
  enabled: Joi.bool().default(true)
})

module.exports = schema
