const Joi = require('joi')
const { getByEmailAndSbi } = require('../api-requests/users')
const { setFarmerApplyData } = require('../session')
const { organisation: organisationKey } = require('../session/keys').farmerApplyData
const { lookupToken, setAuthCookie } = require('../auth')
const { sendMonitoringEvent } = require('../event')
const urlPrefix = require('../config/index').urlPrefix

function isRequestInvalid (cachedEmail, email) {
  return !cachedEmail || email !== cachedEmail
}

async function cacheFarmerApplyData (request, email, sbi) {
  const organisation = await getByEmailAndSbi(email, sbi)
  setFarmerApplyData(request, organisationKey, organisation)
}

module.exports = [{
  method: 'GET',
  path: `${urlPrefix}/verify-login`,
  options: {
    auth: false,
    validate: {
      query: Joi.object({
        email: Joi.string().email(),
        token: Joi.string().uuid().required(),
        sbi: Joi.string()
      }),
      failAction: async (request, h, error) => {
        console.error(error)
        sendMonitoringEvent(request.yar.id, error.details[0].message, '')
        return h.view('verify-login-failed').code(400).takeover()
      }
    },
    handler: async (request, h) => {
      const { email, token, sbi } = request.query

      const { email: cachedEmail, redirectTo, userType } = await lookupToken(request, token)
      if (isRequestInvalid(cachedEmail, email)) {
        sendMonitoringEvent(request.yar.id, 'Invalid token', email)
        return h.view('verify-login-failed').code(400)
      }

      setAuthCookie(request, email, userType)
      await cacheFarmerApplyData(request, email, sbi)

      return h.redirect(redirectTo)
    }
  }
}]
