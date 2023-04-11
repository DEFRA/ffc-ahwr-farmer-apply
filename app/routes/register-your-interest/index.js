const urlPrefix = require('../../config/index').urlPrefix
const ruralPaymentsAgency = require('../../config/index').ruralPaymentsAgency
const defraIdConfig = require('../../config').authConfig.defraId
const BUSINESS_EMAIL_SCHEMA = require('../../schemas/business-email.schema.js')
const Joi = require('joi')

const ERROR_MESSAGE = {
  enterYourEmailAddress: 'Enter your business email address',
  enterYourEmailAddressInCorrectFormat: 'Enter your email address in the correct format, like name@example.com'
}

module.exports = [
  {
    method: 'GET',
    path: `${urlPrefix}/register-your-interest`,
    options: {
      auth: false,
      handler: async (request, h) => {
        if (defraIdConfig.enabled) {
          return h.view('defra-id/register-your-interest/index', { ruralPaymentsAgency })
        } else {
          return h.view('register-your-interest/index', { ruralPaymentsAgency })
        }
      }
    }
  },
  {
    method: 'POST',
    path: `${urlPrefix}/register-your-interest`,
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
            'defra-id/register-your-interest/index',
            {
              ...request.payload,
              ruralPaymentsAgency,
              errorMessages
            }
          ).code(400).takeover()
        }
      },
      handler: async (request, h) => {
        if (defraIdConfig.enabled === true) {
          return h.redirect('register-your-interest/registration-complete', { ruralPaymentsAgency })
        }
        console.log('Defra ID is not enabled', request)
        return h.redirect('register-your-interest',
          {
            ...request.payload,
            ruralPaymentsAgency,
            errorMessage: 'Defra ID is not enabled'
          }).code(400).takeover()
      }
    }
  }
]
