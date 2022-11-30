const Joi = require('joi')
const uuidRegex = require('./uuid-regex')
const notifyApiKeyRegex = new RegExp(`.*-${uuidRegex}-${uuidRegex}`)

const notifySchema = Joi.object({
  apiKey: Joi.string().pattern(notifyApiKeyRegex),
  templateIdFarmerApplyLogin: Joi.string().uuid(),
  templateIdFarmerRegisterYourInterest: Joi.string().uuid(),
  testToken: Joi.string().uuid().optional()
})

const notifyConfig = {
  apiKey: process.env.NOTIFY_API_KEY,
  templateIdFarmerApplyLogin: process.env.NOTIFY_TEMPLATE_ID_FARMER_APPLY_LOGIN,
  templateIdFarmerRegisterYourInterest: process.env.NOTIFY_TEMPLATE_ID_FARMER_REGISTER_INTEREST,
  testToken: process.env.TEST_TOKEN
}
const notifyResult = notifySchema.validate(notifyConfig, {
  abortEarly: false
})

if (notifyResult.error) {
  throw new Error(`The notify config is invalid. ${notifyResult.error.message}`)
}

module.exports = notifyResult.value
