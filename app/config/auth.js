const Joi = require('joi')

const authSchema = Joi.object({
  authHostUrl: Joi.string().required(),
  authClientSecret: Joi.string().required(),
  authClientId: Joi.string().required(),
  useAuth: Joi.bool().default(false)
})

const authConfig = {
  authHostUrl: process.env.DEFRA_AUTH_HOST_URL,
  authClientId: process.env.DEFRA_AUTH_CLIENT_ID,
  authClientSecret: process.env.DEFRA_AUTH_CLIENT_SECRET,
  useAuth: process.env.DEFRA_USE_AUTH
}

const authResult = authSchema.validate(authConfig, {
  abortEarly: false
})

if (authResult.error) {
  throw new Error(`The auth config is invalid. ${authResult.error.message}`)
}

module.exports = authResult.value
