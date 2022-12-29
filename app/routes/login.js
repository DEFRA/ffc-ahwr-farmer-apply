const boom = require('@hapi/boom')
const Joi = require('joi')
const { getByEmailAndSbi } = require('../api-requests/users')
const { email: emailValidation } = require('../lib/validation/email')
const { sbi: sbiValidation } = require('../lib/validation/sbi')
const { sendFarmerApplyLoginMagicLink } = require('../lib/email/send-magic-link-email')
const { clear } = require('../session')
const { sendMonitoringEvent } = require('../event')

const hintText = 'We\'ll use this to send you a link to apply for a review'
const urlPrefix = require('../config/index').urlPrefix

module.exports = [{
  method: 'GET',
  path: `${urlPrefix}/login`,
  options: {
    auth: {
      mode: 'try'
    },
    plugins: {
      'hapi-auth-cookie': {
        redirectTo: false
      }
    },
    handler: async (request, h) => {
      if (request.auth.isAuthenticated) {
        return h.redirect(request.query?.next || `${urlPrefix}/org-review`)
      }

      return h.view('login', { hintText })
    }
  }
},
{
  method: 'POST',
  path: `${urlPrefix}/login`,
  options: {
    auth: {
      mode: 'try'
    },
    validate: {
      payload: Joi.object({
        email: emailValidation,
        sbi: sbiValidation
      }),
      failAction: async (request, h, error) => {
        const { email, sbi } = request.payload
        const errorMessages = error
        .details
        .reduce((acc, e) => ({ ...acc, [e.context.label]: { text: e.message } }), {})
        sendMonitoringEvent(request.yar.id, error.details[0].message, email, sbi)
        return h.view('login', { ...request.payload, errorMessages, hintText }).code(400).takeover()
      }
    },
    handler: async (request, h) => {
      const { email, sbi } = request.payload
      const organisation = await getByEmailAndSbi(email, sbi)

      if (!organisation) {
        sendMonitoringEvent(request.yar.id, `No user found with email address and sbi "${email}", "${sbi}"`, email, sbi)
        return h.view('login', { ...request.payload, errorMessage: { text: `No user found with email address "${email}" and sbi "${sbi}"` }, hintText }).code(400).takeover()
      }

      clear(request)
      const result = await sendFarmerApplyLoginMagicLink(request, email, sbi)

      if (!result) {
        return boom.internal()
      }

      return h.view('check-email', { activityText: 'The email includes a link to apply for a review. This link will expire in 15 minutes.', email })
    }
  }
}]
