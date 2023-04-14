const Joi = require('joi')
const { lookupToken, setAuthCookie } = require('../../auth')
const { sendMonitoringEvent } = require('../../event')
const config = require('../../config')

function isRequestInvalid (cachedEmail, email) {
  console.log(`Comparing cached email ${cachedEmail} with type ${typeof cachedEmail} to email from verify-login query param ${email} with type ${typeof email}.`)
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
        console.error(`Validation error - ${error.message} for query string - ${JSON.stringify(request.query)}`)
        sendMonitoringEvent(request.yar.id, error.details[0].message, '', getIp(request))
        return h.view('verify-login-failed', {
          backLink: `${config.urlPrefix}/login`
        }).code(400).takeover()
      }
    },
    handler: async (request, h) => {
      console.log(`Verify Login query parameters - ${JSON.stringify(request.query)}.`)

      const { email, token } = request.query
      const { magiclinkCache } = request.server.app

      const { email: cachedEmail, redirectTo, userType } = await lookupToken(request, token)
      console.error(`Retrieved ${cachedEmail} from cache for request id ${request.yar.id}.`)

      if (isRequestInvalid(cachedEmail, email)) {
        console.error(`Email in the verify login link does not match the cached email for request id ${request.yar.id}.`)
        sendMonitoringEvent(request.yar.id, 'Invalid token', email, getIp(request))
        return h.view('verify-login-failed', {
          backLink: `${config.urlPrefix}/login`
        }).code(400).takeover()
      }

      setAuthCookie(request, email, userType)

      await magiclinkCache.drop(email)
      await magiclinkCache.drop(token)

      return h.redirect(`${redirectTo}${(`?businessEmail=${email}`)}`)
    }
  }
}]
