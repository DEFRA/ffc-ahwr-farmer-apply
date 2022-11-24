const session = require('../session')
const { crn: crnKey } = require('../session/keys').registerYourInterestData
const Joi = require('joi')
const urlPrefix = require('../config/index').urlPrefix
const ruralPaymentsLoginUri = require('../config/index').ruralPaymentsLoginUri
const callChargesUri = require('../config/index').callChargesUri
const ruralPaymentsEmail = require('../config/index').ruralPaymentsEmail
const { crn: crnErrorMessages } = require('../../app/lib/error-messages')

module.exports = [{
  method: 'GET',
  path: `${urlPrefix}/register-your-interest`,
  options: {
    auth: false,
    handler: async (request, h) => {
      return h.view('register-your-interest', { ruralPaymentsLoginUri, callChargesUri, ruralPaymentsEmail })
    }
  }
},
{
  method: 'GET',
  path: `${urlPrefix}/register-your-interest/crn-enter`,
  options: {
    auth: false,
    handler: async (request, h) => {
      const crn = session.getRegisterYourInterestData(request, crnKey)
      return h.view('crn-enter', { callChargesUri, ruralPaymentsEmail, crn })
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
            'any.required': crnErrorMessages.enterCrn,
            'string.base': crnErrorMessages.enterCrn,
            'string.empty': crnErrorMessages.enterCrn,
            'string.max': crnErrorMessages.crnLength,
            'string.min': crnErrorMessages.crnLength
          }),
        confirmcrn: Joi.alternatives().conditional('confirmcrn', { is: Joi.string().trim().required(), then: Joi.equal(Joi.ref('crn')), otherwise: Joi.string().trim().required() })
          .messages({
            'any.required': crnErrorMessages.confirmCrn,
            'string.base': crnErrorMessages.confirmCrn,
            'string.empty': crnErrorMessages.confirmCrn,
            'any.only': crnErrorMessages.matchCrn
          })
      }),
      failAction: async (request, h, error) => {
        const errors = {}
        error.details.forEach(e => {
          const messageForLabel = e.context.label + 'ErrorMessage'
          errors[messageForLabel] = e.message
        })
        return h.view('crn-enter', { ...request.payload, errors }).code(400).takeover()
      }
    },
    handler: async (request, h) => {
      session.setRegisterYourInterestData(request, crnKey, request.payload[crnKey])
      return h.redirect('sbi-enter', { callChargesUri, ruralPaymentsEmail })
    }
  }
}]
