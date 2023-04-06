const config = require('../config')
const session = require('../session')
const { requestAuthorizationCodeUrl } = require('../auth')
const Joi = require('joi')
const BUSINESS_EMAIL_SCHEMA = require('../schemas/business-email.schema.js')

const ERROR_MESSAGE = {
  enterYourEmailAddress: 'Enter your business email address',
  enterYourEmailAddressInCorrectFormat: 'Enter your email address in the correct format, like name@example.com'
}

module.exports = [
  {
    method: 'GET',
    path: `${config.urlPrefix}/start`,
    options: {
      auth: false,
      handler: async (request, h) => {
        if (config.authConfig.defraId.enabled) {
          return h.view('defra-id/index', {
            defraIdLogin: requestAuthorizationCodeUrl(session, request),
            ruralPaymentsAgency: config.ruralPaymentsAgency
          })
        } else {
          return h.view('index', { ruralPaymentsAgency: config.ruralPaymentsAgency })
        }
      }
    }
  },
  {
    method: 'POST',
    path: `${config.urlPrefix}/start`,
    options: {
      auth: false,
      validate: {
        payload: Joi.object({
          emailAddress: BUSINESS_EMAIL_SCHEMA
            .messages({
              'any.required': ERROR_MESSAGE.enterYourEmailAddress,
              'string.base': ERROR_MESSAGE.enterYourEmailAddress,
              'string.empty': ERROR_MESSAGE.enterYourEmailAddress,
              'string.email': ERROR_MESSAGE.enterYourEmailAddressInCorrectFormat
            })
        }),
        failAction: async (request, h, error) => {
          const errorMessages = error
            .details
            .reduce((acc, e) => ({ ...acc, [e.context.label]: { text: e.message } }), {})
          return h.view(
            'defra-id/index',
            {
              ...request.payload,
              ruralPaymentsAgency: config.ruralPaymentsAgency,
              errorMessages
            }
          ).code(400).takeover()
        }
      },
      handler: async (request, h) => {
        return h.redirect('register-your-interest/registration-complete', { ruralPaymentsAgency: config.ruralPaymentsAgency })
      }
    }
  }
]
