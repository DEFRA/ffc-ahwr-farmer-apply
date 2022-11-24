const session = require('../session')
const { crn: crnKey } = require('../session/keys').registerYourInterestData
const Joi = require('joi')
const urlPrefix = require('../config/index').urlPrefix
const callChargesUri = require('../config/index').callChargesUri
const ruralPaymentsEmail = require('../config/index').ruralPaymentsEmail

const ERROR_MESSAGE = {
  enterYourCrnNumber: 'Enter a CRN',
  enterCrnNumberThatHas10Digits: 'Enter a CRN that has 10 digits',
  confirmYourCrnNumber: 'Confirm your CRN',
  crnNumbersDoNotMatch: 'The CRNs do not match'
}

module.exports = [
  {
    method: 'GET',
    path: `${urlPrefix}/register-your-interest/crn-enter`,
    options: {
      auth: false,
      handler: async (request, h) => {
        const crn = session.getRegisterYourInterestData(request, crnKey)
        return h.view('enter-your-crn', { callChargesUri, ruralPaymentsEmail, crn })
      }
    }
  },
  {
    method: 'POST',
    path: `${urlPrefix}/register-your-interest/crn-enter`,
    options: {
      auth: false,
      validate: {
        payload: Joi.object({
          crn: Joi.string().trim().min(10).max(10).required()
            .messages({
              'any.required': ERROR_MESSAGE.enterYourCrnNumber,
              'string.base': ERROR_MESSAGE.enterYourCrnNumber,
              'string.empty': ERROR_MESSAGE.enterYourCrnNumber,
              'string.max': ERROR_MESSAGE.enterCrnNumberThatHas10Digits,
              'string.min': ERROR_MESSAGE.enterCrnNumberThatHas10Digits
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
          return h.view('enter-your-crn', { ...request.payload, errorMessages }).code(400).takeover()
        }
      },
      handler: async (request, h) => {
        session.setRegisterYourInterestData(request, crnKey, request.payload[crnKey])
        return h.redirect('enter-your-sbi', { callChargesUri, ruralPaymentsEmail })
      }
    }
  }
]
