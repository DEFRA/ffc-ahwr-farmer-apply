const session = require('../../session')
const sessionKeys = require('../../session/keys')
const Joi = require('joi')
const urlPrefix = require('../../config/index').urlPrefix
const ruralPaymentsAgency = require('../../config/index').ruralPaymentsAgency
const CRN_SCHEMA = require('../../schemas/crn.schema.js')

const ERROR_MESSAGE = {
  enterYourCrnNumber: 'Enter your CRN',
  enterCrnNumberThatHas10Digits: 'Enter a CRN that has 10 digits',
  confirmYourCrnNumber: 'Confirm your CRN',
  crnNumbersDoNotMatch: 'The CRNs do not match',
  crnNumberOutOfRange: 'The customer reference number (CRN) is not recognised'
}

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
            ruralPaymentsAgency,
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
          crn: CRN_SCHEMA
            .messages({
              'any.required': ERROR_MESSAGE.enterYourCrnNumber,
              'number.base': ERROR_MESSAGE.enterCrnNumberThatHas10Digits,
              'number.integer': ERROR_MESSAGE.enterCrnNumberThatHas10Digits,
              'number.less': ERROR_MESSAGE.enterCrnNumberThatHas10Digits,
              'number.greater': ERROR_MESSAGE.enterCrnNumberThatHas10Digits,
              'number.min': ERROR_MESSAGE.crnNumberOutOfRange,
              'number.max': ERROR_MESSAGE.crnNumberOutOfRange
            }),
          confirmCrn: Joi.alternatives().conditional('confirmCrn', { is: Joi.string().trim().required(), then: Joi.number().equal(Joi.ref('crn')), otherwise: Joi.string().trim().required() })
            .messages({
              'any.required': ERROR_MESSAGE.confirmYourCrnNumber,
              'string.base': ERROR_MESSAGE.confirmYourCrnNumber,
              'number.base': ERROR_MESSAGE.confirmYourCrnNumber,
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
            ruralPaymentsAgency,
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
        return h.redirect('enter-your-sbi', { ruralPaymentsAgency })
      }
    }
  }
]
