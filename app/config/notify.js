const Joi = require('joi')
const uuidRegex = require('./uuid-regex')
const notifyApiKeyRegex = new RegExp(`.*-${uuidRegex}-${uuidRegex}`)

const notifySchema = Joi.object({
  apiKey: Joi.string().pattern(notifyApiKeyRegex),
  emailTemplates: {
    registerYourInterest: Joi.string().uuid(),
    accessGranted: Joi.string().uuid(),
    accessNotGranted: Joi.string().uuid()
  }
})

const notifyConfig = {
  apiKey: process.env.NOTIFY_API_KEY,
  emailTemplates: {
    registerYourInterest: process.env.NOTIFY_TEMPLATE_ID_DEFRA_ID_REGISTER_INTEREST,
    accessGranted: process.env.NOTIFY_TEMPLATE_ID_FARMER_ACCESS_GRANTED,
    accessNotGranted: process.env.NOTIFY_TEMPLATE_ID_FARMER_ACCESS_NOT_GRANTED
  }
}
const notifyResult = notifySchema.validate(notifyConfig, {
  abortEarly: false
})

if (notifyResult.error) {
  throw new Error(`The notify config is invalid. ${notifyResult.error.message}`)
}

module.exports = notifyResult.value
