const Joi = require('joi')
const session = require('../../session')
const sessionKeys = require('../../session/keys')
const urlPrefix = require('../../config/index').urlPrefix
const callChargesUri = require('../../config/index').callChargesUri
const ruralPaymentsEmail = require('../../config/index').ruralPaymentsEmail

const ERROR_MESSAGE = {
  enterYourSbiNumber: 'Enter your SBI number',
  enterSbiNumberThatHas9Digits: 'Enter an SBI number that has 9 digits',
  confirmYourSbiNumber: 'Confirm your SBI number',
  sbiNumbersDoNotMatch: 'SBI numbers do not match',
  sbiNumberOutOfRange: 'The SBI number is out of range'
}
const MIN_SBI_NUMBER = 105000000
const MAX_SBI_NUMBER = 210000000

module.exports = [
  {
    method: 'GET',
    path: `${urlPrefix}/register-your-interest/enter-your-sbi`,
    options: {
      auth: false,
      handler: async (request, h) => {
        return h.view(
          'register-your-interest/enter-your-sbi',
          {
            callChargesUri,
            ruralPaymentsEmail,
            sbi: session.getRegisterYourInterestData(
              request,
              sessionKeys.registerYourInterestData.sbi
            ),
            confirmSbi: session.getRegisterYourInterestData(
              request,
              sessionKeys.registerYourInterestData.confirmSbi
            )
          }
        )
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
            .number()
            .required()
            .integer()
            .min(MIN_SBI_NUMBER)
            .max(MAX_SBI_NUMBER)
            .less(1000000000)
            .greater(99999999.9)
            .messages({
              'any.required': ERROR_MESSAGE.enterYourSbiNumber,
              'number.base': ERROR_MESSAGE.enterSbiNumberThatHas9Digits,
              'number.less': ERROR_MESSAGE.enterSbiNumberThatHas9Digits,
              'number.greater': ERROR_MESSAGE.enterSbiNumberThatHas9Digits,
              'number.min': ERROR_MESSAGE.sbiNumberOutOfRange,
              'number.max': ERROR_MESSAGE.sbiNumberOutOfRange
            }),
          confirmSbi: Joi
            .alternatives()
            .conditional('confirmSbi', {
              is: Joi.string().trim().required(),
              then: Joi.number().equal(Joi.ref('sbi')),
              otherwise: Joi.string().trim().required()
            })
            .messages({
              'any.required': ERROR_MESSAGE.confirmYourSbiNumber,
              'string.base': ERROR_MESSAGE.confirmYourSbiNumber,
              'number.base': ERROR_MESSAGE.confirmYourSbiNumber,
              'string.empty': ERROR_MESSAGE.confirmYourSbiNumber,
              'any.only': ERROR_MESSAGE.sbiNumbersDoNotMatch
            })
        }),
        failAction: async (request, h, error) => {
          const errorMessages = error
            .details
            .reduce((acc, e) => ({ ...acc, [e.context.label]: { text: e.message } }), {})
          return h.view(
            'register-your-interest/enter-your-sbi',
            {
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
          sessionKeys.registerYourInterestData.sbi,
          request.payload[sessionKeys.registerYourInterestData.sbi]
        )
        session.setRegisterYourInterestData(
          request,
          sessionKeys.registerYourInterestData.confirmSbi,
          request.payload[sessionKeys.registerYourInterestData.confirmSbi]
        )
        return h.redirect('enter-your-email-address', { callChargesUri, ruralPaymentsEmail })
      }
    }
  }
]
