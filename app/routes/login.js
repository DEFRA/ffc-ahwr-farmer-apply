const boom = require('@hapi/boom')
const Joi = require('joi')
const { getByEmail } = require('../api-requests/users')
const { email: emailValidation } = require('../lib/validation/email')
const { sendFarmerApplyLoginMagicLink } = require('../lib/email/send-magic-link-email')
const { clear } = require('../session')
const { sendMonitoringEvent } = require('../event')
const authConfig = require('../config').authConfig
const { serviceUri } = require('../config')

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
      if(authConfig.useAuth){
        const redirect_uri ='https%3A%2F%2Fffc-ahwr-farmer-test.azure.defra.cloud%2Fclaim%2Fsignout' //encodeURI(`${serviceUri}/signout`)
        let url = `${authConfig.authHostUrl}client_Id=${authConfig.authClientId}&nonce=defaultNonce&scope=openid&response_type=code&prompt=login&serviceId=edd7a972-414d-402c-9dc5-a39403035413`
        url = `${url}&redirect_uri=${redirect_uri}`
        
        console.log(url)
        return h.redirect(url)
      }

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
        sendMonitoringEvent(request.yar.id, error.details[0].message, email)
        return h.view('login', { ...request.payload, errorMessage: { text: error.details[0].message }, hintText }).code(400).takeover()
      }
    },
    handler: async (request, h) => {
      const { email } = request.payload
      const organisation = await getByEmail(email)

      if (!organisation) {
        sendMonitoringEvent(request.yar.id, `No user found with email address "${email}"`, email)
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
