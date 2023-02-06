const Joi = require('joi')

const schema = Joi.object({
  uri: Joi.string().uri().default('http://host.docker.internal:3001/api')
})

module.exports = schema
