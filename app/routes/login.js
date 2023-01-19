const boom = require('@hapi/boom')
const Joi = require('joi')
const { getByEmail } = require('../api-requests/users')
const { email: emailValidation } = require('../lib/validation/email')
const { sendFarmerApplyLoginMagicLink } = require('../lib/email/send-magic-link-email')
const { clear } = require('../session')
const { sendMonitoringEvent } = require('../event')

const hintText = 'We\'ll use this to send you a link to apply for a review. This must be the business email address linked to the business applying for a review.'

const urlPrefix = require('../config/index').urlPrefix

const getIp = (request) => {
  const xForwardedForHeader = request.headers['x-forwarded-for']
  return xForwardedForHeader ? xForwardedForHeader.split(',')[0] : request.info.remoteAddress
}

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
        email: emailValidation
      }),
      failAction: async (request, h, error) => {
        const { email } = request.payload
        sendMonitoringEvent(request.yar.id, error.details[0].message, email, getIp(request))
        return h.view('login', { ...request.payload, errorMessage: { text: error.details[0].message }, hintText }).code(400).takeover()
      }
    },
    handler: async (request, h) => {
      const { email } = request.payload
      const organisation = await getByEmail(email)

      if (!organisation) {
        sendMonitoringEvent(request.yar.id, `No user found with email address "${email}"`, email, getIp(request))
        return h.view('login', { ...request.payload, errorMessage: { text: `No user found with email address "${email}"` }, hintText }).code(400).takeover()
      }

      clear(request)
      const result = await sendFarmerApplyLoginMagicLink(request, email)

      if (!result) {
        return boom.internal()
      }

      return h.view('check-email', { activityText: 'The email includes a link to apply for a review. This link will expire in 15 minutes.', email })
    }
  }
}]
