const session = require('../../session')
const sessionKeys = require('../../session/keys')
const Joi = require('joi')
const urlPrefix = require('../../config/index').urlPrefix
const callChargesUri = require('../../config/index').callChargesUri
const ruralPaymentsEmail = require('../../config/index').ruralPaymentsEmail

const ERROR_MESSAGE = {
  enterYourCrnNumber: 'Enter a CRN',
  enterCrnNumberThatHas10Digits: 'Enter a CRN that has 10 digits',
  confirmYourCrnNumber: 'Confirm your CRN',
  crnNumbersDoNotMatch: 'The CRNs do not match',
  crnNumberOutOfRange: 'The CRN is out of range'
}
const MIN_CRN_NUMBER = 1100000000
const MAX_CRN_NUMBER = 1110000000

const PATH = `${urlPrefix}/register-your-interest/enter-your-crn`

module.exports = [
  {
    method: 'GET',
    path: PATH,
    options: {
      auth: false,
      handler: async (request, h) => {
        return h.view(
          'register-your-interest/enter-your-crn',
          {
            callChargesUri,
            ruralPaymentsEmail,
            crn: session.getRegisterYourInterestData(request, sessionKeys.registerYourInterestData.crn),
            confirmCrn: session.getRegisterYourInterestData(request, sessionKeys.registerYourInterestData.confirmCrn)
          }
        )
      }
    }
  },
  {
    method: 'POST',
    path: PATH,
    options: {
      auth: false,
      validate: {
        payload: Joi.object({
          crn: Joi
            .string()
            .trim()
            .regex(/^\d{10}$/)
            .required()
            .number()
            .min(MIN_CRN_NUMBER)
            .max(MAX_CRN_NUMBER)
            .messages({
              'any.required': ERROR_MESSAGE.enterYourCrnNumber,
              'string.base': ERROR_MESSAGE.enterYourCrnNumber,
              'string.empty': ERROR_MESSAGE.enterYourCrnNumber,
              'string.pattern.base': ERROR_MESSAGE.enterCrnNumberThatHas10Digits,
              'number.min': ERROR_MESSAGE.crnNumberOutOfRange,
              'number.max': ERROR_MESSAGE.crnNumberOutOfRange
            }),
          confirmCrn: Joi.alternatives().conditional('confirmCrn', { is: Joi.string().trim().required(), then: Joi.equal(Joi.ref('crn')), otherwise: Joi.string().trim().required() })
            .messages({
              'any.required': ERROR_MESSAGE.confirmYourCrnNumber,
              'string.base': ERROR_MESSAGE.confirmYourCrnNumber,
              'string.empty': ERROR_MESSAGE.confirmYourCrnNumber,
              'any.only': ERROR_MESSAGE.crnNumbersDoNotMatch
            })
        }),
        failAction: async (request, h, error) => {
          const errorMessages = error
            .details
            .reduce((acc, e) => ({ ...acc, [e.context.label]: { text: e.message } }), {})
          return h.view('register-your-interest/enter-your-crn', {
            ...request.payload,
            callChargesUri,
            ruralPaymentsEmail,
            errorMessages
          }
          ).code(400).takeover()
        }
      },
      handler: async (request, h) => {
        session.setRegisterYourInterestData(
          request,
          sessionKeys.registerYourInterestData.crn,
          request.payload[sessionKeys.registerYourInterestData.crn]
        )
        session.setRegisterYourInterestData(
          request,
          sessionKeys.registerYourInterestData.confirmCrn,
          request.payload[sessionKeys.registerYourInterestData.confirmCrn]
        )
        return h.redirect('enter-your-sbi', { callChargesUri, ruralPaymentsEmail })
      }
    }
  }
]
