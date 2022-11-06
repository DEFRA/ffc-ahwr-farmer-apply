const boom = require('@hapi/boom')
const Joi = require('joi')
const { getByEmail } = require('../api-requests/users')
const { email: emailValidation } = require('../lib/validation/email')
const { sendFarmerApplyLoginMagicLink } = require('../lib/email/send-magic-link-email')
const { clear } = require('../session')
const { sendMonitoringEvent } = require('../event')

const hintText = 'We\'ll use this to send you a link to apply for a review'
const urlPrefix = require('../config/index').urlPrefix

module.exports = [
{
  method: 'POST',
  path: `${urlPrefix}/signin-oidc`,
  options: {
    // auth: {
    //   mode: 'try'
    // },
    // validate: {
    //   payload: Joi.object({
    //     email: emailValidation
    //   }),
    //   failAction: async (request, h, error) => {
    //     const { email } = request.payload
    //     sendMonitoringEvent(request.yar.id, error.details[0].message, email)
    //     return h.view('login', { ...request.payload, errorMessage: { text: error.details[0].message }, hintText }).code(400).takeover()
    //   }
    // },
    handler: async (request, h) => {
      console.log(request.payload, 'Payload')
      return h.view('check-email', { activityText: 'The email includes a link to apply for a review. This link will expire in 15 minutes.', email })
    }
  }
}]
