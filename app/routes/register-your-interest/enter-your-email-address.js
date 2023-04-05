const Joi = require('joi')
const session = require('../../session')
const sessionKeys = require('../../session/keys')
const urlPrefix = require('../../config/index').urlPrefix
const ruralPaymentsAgency = require('../../config/index').ruralPaymentsAgency
const BUSINESS_EMAIL_SCHEMA = require('../../schemas/business-email.schema.js')

const ERROR_MESSAGE = {
  enterYourEmailAddress: 'Enter your business email address',
  enterYourEmailAddressInCorrectFormat: 'Enter your email address in the correct format, like name@example.com',
  confirmYourEmailAddress: 'Confirm your email address',
  emailAddressesDoNotMatch: 'Email addresses entered do not match'
}

const PATH = `${urlPrefix}/register-your-interest/enter-your-email-address`

module.exports = [
  {
    method: 'GET',
    path: PATH,
    options: {
      auth: false,
      handler: async (request, h) => {
        return h.view(
          'register-your-interest/enter-your-email-address',
          {
            ruralPaymentsAgency,
            emailAddress: session.getRegisterYourInterestData(
              request,
              sessionKeys.registerYourInterestData.emailAddress
            ),
            confirmEmailAddress: session.getRegisterYourInterestData(
              request,
              sessionKeys.registerYourInterestData.confirmEmailAddress
            )
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
          emailAddress: BUSINESS_EMAIL_SCHEMA
            .messages({
              'any.required': ERROR_MESSAGE.enterYourEmailAddress,
              'string.base': ERROR_MESSAGE.enterYourEmailAddress,
              'string.empty': ERROR_MESSAGE.enterYourEmailAddress,
              'string.email': ERROR_MESSAGE.enterYourEmailAddressInCorrectFormat
            }),
          confirmEmailAddress: Joi
            .alternatives()
            .conditional('confirmEmailAddress', {
              is: BUSINESS_EMAIL_SCHEMA,
              then: BUSINESS_EMAIL_SCHEMA.equal(Joi.ref('emailAddress')),
              otherwise: BUSINESS_EMAIL_SCHEMA
            })
            .messages({
              'any.required': ERROR_MESSAGE.confirmYourEmailAddress,
              'string.base': ERROR_MESSAGE.confirmYourEmailAddress,
              'string.empty': ERROR_MESSAGE.confirmYourEmailAddress,
              'any.only': ERROR_MESSAGE.emailAddressesDoNotMatch
            })
        }),
        failAction: async (request, h, error) => {
          const errorMessages = error
            .details
            .reduce((acc, e) => ({ ...acc, [e.context.label]: { text: e.message } }), {})
          return h.view(
            'register-your-interest/enter-your-email-address',
            {
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
          sessionKeys.registerYourInterestData.emailAddress,
          request.payload[sessionKeys.registerYourInterestData.emailAddress]
        )
        session.setRegisterYourInterestData(
          request,
          sessionKeys.registerYourInterestData.confirmEmailAddress,
          request.payload[sessionKeys.registerYourInterestData.confirmEmailAddress]
        )
        return h.redirect('check-your-answers-and-register-your-interest', { ruralPaymentsAgency })
      }
    }
  }
]
