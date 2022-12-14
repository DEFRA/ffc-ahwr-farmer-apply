const session = require('../../session')
const sessionKeys = require('../../session/keys')
const urlPrefix = require('../../config/index').urlPrefix
const ruralPaymentsLoginUri = require('../../config/index').ruralPaymentsLoginUri
const callChargesUri = require('../../config/index').callChargesUri
const ruralPaymentsEmail = require('../../config/index').ruralPaymentsEmail
const sendEmail = require('../../lib/email/send-email')
const { registerYourInterest } = require('../../config').notifyConfig.emailTemplates
const { sendRegisterYourInterestMessage } = require('../../messaging/register-your-interest')

const PATH = `${urlPrefix}/register-your-interest/check-your-answers-and-register-your-interest`

module.exports = [
  {
    method: 'GET',
    path: PATH,
    options: {
      auth: false,
      handler: async (request, h) => {
        if (session.lacksAny(request, session.entries.registerYourInterestData, [
          sessionKeys.registerYourInterestData.crn,
          sessionKeys.registerYourInterestData.sbi,
          sessionKeys.registerYourInterestData.emailAddress
        ])) {
          session.clear(request)
          return h.redirect(
            `${urlPrefix}/register-your-interest`,
            {
              ruralPaymentsLoginUri,
              callChargesUri,
              ruralPaymentsEmail
            }
          )
        }
        const rows = [
          {
            key: { text: 'Customer reference number' },
            value: { html: session.getRegisterYourInterestData(request, sessionKeys.registerYourInterestData.crn) },
            actions: {
              items: [
                {
                  href: `${urlPrefix}/register-your-interest/enter-your-crn`,
                  text: 'Change',
                  visuallyHiddenText: 'Change your CRN'
                }
              ]
            }
          },
          {
            key: { text: 'Single business identifier number' },
            value: { html: session.getRegisterYourInterestData(request, sessionKeys.registerYourInterestData.sbi) },
            actions: {
              items: [
                {
                  href: `${urlPrefix}/register-your-interest/enter-your-sbi`,
                  text: 'Change',
                  visuallyHiddenText: 'Change your SBI'
                }
              ]
            }
          },
          {
            key: { text: 'Email address' },
            value: { html: session.getRegisterYourInterestData(request, sessionKeys.registerYourInterestData.emailAddress) },
            actions: {
              items: [
                {
                  href: `${urlPrefix}/register-your-interest/enter-your-email-address`,
                  text: 'Change',
                  visuallyHiddenText: 'Change your email address'
                }
              ]
            }
          }
        ]
        return h.view('register-your-interest/check-your-answers-and-register-your-interest', { rows })
      }
    }
  },
  {
    method: 'POST',
    path: PATH,
    options: {
      auth: false,
      handler: async (request, h) => {
        const emailAddress = session.getRegisterYourInterestData(request, sessionKeys.registerYourInterestData.emailAddress)
        const sbi = session.getRegisterYourInterestData(request, sessionKeys.registerYourInterestData.sbi)
        const crn = session.getRegisterYourInterestData(request, sessionKeys.registerYourInterestData.crn)
        await sendEmail(registerYourInterest, emailAddress)
        await sendRegisterYourInterestMessage(sbi, crn, emailAddress)
        return h.redirect('registration-complete', { callChargesUri, ruralPaymentsEmail })
      }
    }
  }
]
