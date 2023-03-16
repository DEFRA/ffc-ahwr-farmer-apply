const Joi = require('joi')
const { lookupToken, setAuthCookie } = require('../../auth')
const { sendMonitoringEvent } = require('../../event')
const config = require('../../config')
const session = require('../../session')
const auth = require('../../auth')

function isRequestInvalid (cachedEmail, email) {
  return !cachedEmail || email !== cachedEmail
}

const getIp = (request) => {
  const xForwardedForHeader = request.headers['x-forwarded-for']
  return xForwardedForHeader ? xForwardedForHeader.split(',')[0] : request.info.remoteAddress
}

module.exports = [{
  method: 'GET',
  path: `${config.urlPrefix}/verify-login`,
  options: {
    auth: false,
    validate: {
      query: Joi.object({
        email: Joi.string().email(),
        token: Joi.string().uuid().required()
      }),
      failAction: async (request, h, error) => {
        console.error(error)
        sendMonitoringEvent(request.yar.id, error.details[0].message, '', getIp(request))
        return h.view('verify-login-failed', {
          backLink: config.authConfig.defraId.enabled ? auth.getAuthenticationUrl(session, request) : `${config.urlPrefix}/login`
        }).code(400).takeover()
      }
    },
    handler: async (request, h) => {
      const { email, token } = request.query
      const { magiclinkCache } = request.server.app

      const { email: cachedEmail, redirectTo, userType } = await lookupToken(request, token)
      if (isRequestInvalid(cachedEmail, email)) {
        console.error('Email in the verify login link does not match the cached email.')
        sendMonitoringEvent(request.yar.id, 'Invalid token', email, getIp(request))
        return h.view('verify-login-failed', {
          backLink: config.authConfig.defraId.enabled ? auth.getAuthenticationUrl(session, request) : `${config.urlPrefix}/login`
        }).code(400)
      }

      setAuthCookie(request, email, userType)

      await magiclinkCache.drop(email)
      await magiclinkCache.drop(token)

      return h.redirect(`${redirectTo}${(`?businessEmail=${email}`)}`)
    }
  }
}]
