const urlPrefix = require('../../config/index').urlPrefix
const ruralPaymentsAgency = require('../../config/index').ruralPaymentsAgency
const defraIdConfig = require('../../config').authConfig.defraId
const BUSINESS_EMAIL_SCHEMA = require('../../schemas/business-email.schema.js')
const { sendDefraIdRegisterYourInterestMessage } = require('../../messaging/register-your-interest')
const { checkWaitingList } = require('../../api-requests/eligibility-api')
const sendEmail = require('../../lib/email/send-email')
const config = require('../../config')
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
      }
    },
    handler: async (request, h) => {
      const { alreadyRegistered, accessGranted } = await checkWaitingList(request.payload.emailAddress)
      if (!alreadyRegistered) {
        sendEmail(config.notifyConfig.emailTemplates.registerYourInterest, request.payload.emailAddress)
        sendDefraIdRegisterYourInterestMessage(request.payload.emailAddress)
      } else {
        sendEmail(
          accessGranted ? config.notifyConfig.emailTemplates.accessGranted : config.notifyConfig.emailTemplates.accessNotGranted,
          request.payload.emailAddress,
          {
            personalisation: {
              applyGuidanceUrl: config.serviceUri,
              applyVetGuidanceUrl: config.serviceUri + '/guidance-for-vet'
            }
          }
        )
      }
      return h.redirect('register-your-interest/registration-complete', { ruralPaymentsAgency })
    }
  }
]
