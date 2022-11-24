const Joi = require('joi')
const session = require('../session')
const sessionKeys = require('../session/keys')
const urlPrefix = require('../config/index').urlPrefix
const callChargesUri = require('../config/index').callChargesUri
const ruralPaymentsEmail = require('../config/index').ruralPaymentsEmail

const ERROR_MESSAGE = {
  enterYourSbiNumber: 'Enter your SBI number',
  enterSbiNumberThatHas9Digits: 'Enter an SBI number that has 9 digits',
  confirmYourSbiNumber: 'Confirm your SBI number',
  sbiNumbersDoNotMatch: 'SBI numbers do not match'
}

module.exports = [
  {
    method: 'GET',
    path: `${urlPrefix}/register-your-interest/enter-your-sbi`,
    options: {
      auth: false,
      handler: async (request, h) => {
        const sbi = session.getRegisterYourInterestData(request, sessionKeys.enterYourSbi.sbi)
        return h.view('enter-your-sbi', { callChargesUri, ruralPaymentsEmail, sbi })
      }
    }
  },
  {
    method: 'POST',
    path: `${urlPrefix}/register-your-interest/enter-your-sbi`,
    options: {
      auth: false,
      validate: {
        payload: Joi.object({
          sbi: Joi
            .string()
            .trim()
            .min(9)
            .max(9)
            .required()
            .messages({
              'any.required': ERROR_MESSAGE.enterYourSbiNumber,
              'string.base': ERROR_MESSAGE.enterYourSbiNumber,
              'string.empty': ERROR_MESSAGE.enterYourSbiNumber,
              'string.max': ERROR_MESSAGE.enterSbiNumberThatHas9Digits,
              'string.min': ERROR_MESSAGE.enterSbiNumberThatHas9Digits
            }),
          confirmSbi: Joi
            .alternatives()
            .conditional('confirmSbi', {
              is: Joi.string().trim().required(),
              then: Joi.equal(Joi.ref('sbi')),
              otherwise: Joi.string().trim().required()
            })
            .messages({
              'any.required': ERROR_MESSAGE.confirmYourSbiNumber,
              'string.base': ERROR_MESSAGE.confirmYourSbiNumber,
              'string.empty': ERROR_MESSAGE.confirmYourSbiNumber,
              'any.only': ERROR_MESSAGE.sbiNumbersDoNotMatch
            })
        }),
        failAction: async (request, h, error) => {
          const errorMessages = error
            .details
            .reduce((acc, e) => ({ ...acc, [e.context.label]: { text: e.message } }), {})
          return h.view('enter-your-sbi', { ...request.payload, errorMessages }).code(400).takeover()
        }
      },
      handler: async (request, h) => {
        session.setRegisterYourInterestData(request, sessionKeys.enterYourSbi.sbi, request.payload[sessionKeys.enterYourSbi.sbi])
        return h.redirect('enter-your-email', { callChargesUri, ruralPaymentsEmail })
      }
    }
  }
]
