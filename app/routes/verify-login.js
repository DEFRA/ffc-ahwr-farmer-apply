const Joi = require('joi')
const { getByEmail } = require('../api-requests/users')
const { setFarmerApplyData } = require('../session')
const { organisation: organisationKey } = require('../session/keys').farmerApplyData
const { lookupToken, setAuthCookie } = require('../auth')
const { sendMonitoringEvent } = require('../event')
const { urlPrefix, selectYourBusiness } = require('../config')

function isRequestInvalid (cachedEmail, email) {
  return !cachedEmail || email !== cachedEmail
}

async function cacheFarmerApplyData (request, email) {
  const organisation = await getByEmail(email)
  setFarmerApplyData(request, organisationKey, organisation)
}

const getIp = (request) => {
  const xForwardedForHeader = request.headers['x-forwarded-for']
  return xForwardedForHeader ? xForwardedForHeader.split(',')[0] : request.info.remoteAddress
}

module.exports = [{
  method: 'GET',
  path: `${urlPrefix}/verify-login`,
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
        return h.view('verify-login-failed').code(400).takeover()
      }
    },
    handler: async (request, h) => {
      const { email, token } = request.query
      const { magiclinkCache } = request.server.app

      const { email: cachedEmail, redirectTo, userType } = await lookupToken(request, token)
      if (isRequestInvalid(cachedEmail, email)) {
        console.error('Email in the verify login link does not match the cached email.')
        sendMonitoringEvent(request.yar.id, 'Invalid token', email, getIp(request))
        return h.view('verify-login-failed').code(400)
      }

      setAuthCookie(request, email, userType)

      if (selectYourBusiness.enabled === false) {
        await cacheFarmerApplyData(request, email)
      }

      await magiclinkCache.set(token, null)
      await magiclinkCache.set(email, null)

      return h.redirect(`${redirectTo}${selectYourBusiness.enabled ? (`?businessEmail=${email}`) : ''}`)
    }
  }
}]
