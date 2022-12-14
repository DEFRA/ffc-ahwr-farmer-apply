const Joi = require('joi')
const ViewModel = require('./models/cookies-policy')
const { updatePolicy } = require('../cookies')
const { cookie: { cookieNameCookiePolicy } } = require('../config')
const urlPrefix = require('../config/index').urlPrefix

module.exports = [{
  method: 'GET',
  path: `${urlPrefix}/cookies`,
  options: {
    auth: false,
    handler: async (request, h) => {
      return h.view('cookies/cookie-policy', new ViewModel(request.state[cookieNameCookiePolicy], request.query.updated))
    }
  }
}, {
  method: 'POST',
  path: `${urlPrefix}/cookies`,
  options: {
    auth: false,
    plugins: {
      crumb: false
    },
    validate: {
      payload: Joi.object({
        analytics: Joi.boolean(),
        async: Joi.boolean().default(false)
      })
    },
    handler: (request, h) => {
      updatePolicy(request, h, request.payload.analytics)
      if (request.payload.async) {
        return h.response('ok')
      }
      return h.redirect(`${urlPrefix}/cookies?updated=true`)
    }
  }
}]
