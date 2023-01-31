const getToken = require('../auth/get-token')
const sendEmail = require('./send-email')
const { serviceUri, selectYourBusiness} = require('../../config')
const { emailTemplates } = require('../../config').notifyConfig
const { farmerApply } = require('../../constants/user-types')

async function createAndCacheToken (request, email, redirectTo, userType, data) {
  const { magiclinkCache } = request.server.app

  const token = await getToken(email)
  const tokens = await magiclinkCache.get(email) ?? []
  tokens.push(token)
  await magiclinkCache.set(email, tokens)
  await magiclinkCache.set(token, { email, redirectTo, userType, data })
  return token
}

async function sendMagicLinkEmail (request, email, templateId, redirectTo, userType, data) {
  const token = await createAndCacheToken(request, email, redirectTo, userType, data)

  return sendEmail(templateId, email, {
    personalisation: { magiclink: `${serviceUri}/verify-login?token=${token}&email=${email}` },
    reference: token
  })
}

async function sendFarmerApplyLoginMagicLink (request, email) {
  const redirectTo = selectYourBusiness.enabled === true ? 'select-your-business' : 'org-review'
  return sendMagicLinkEmail(request, email, emailTemplates.applyLogin, redirectTo, farmerApply)
}

module.exports = {
  sendFarmerApplyLoginMagicLink
}
