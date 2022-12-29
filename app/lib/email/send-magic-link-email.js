const getToken = require('../auth/get-token')
const sendEmail = require('./send-email')
const { serviceUri } = require('../../config')
const { emailTemplates } = require('../../config').notifyConfig
const { farmerApply } = require('../../constants/user-types')

async function createAndCacheToken (request, email, redirectTo, userType, data, sbi) {
  const { magiclinkCache } = request.server.app

  const token = await getToken(email, sbi)
  const tokens = await magiclinkCache.get(email) ?? []
  tokens.push(token)
  await magiclinkCache.set(email, tokens)
  await magiclinkCache.set(token, { email, redirectTo, userType, data })
  return token
}

async function sendMagicLinkEmail (request, email, templateId, redirectTo, userType, data) {
  const token = await createAndCacheToken(request, email, redirectTo, userType, data)

  return sendEmail(templateId, email, {
    personalisation: { magiclink: `${serviceUri}/verify-login?token=${token}&email=${email}&sbi=${data.sbi}` },
    reference: token
  })
}

async function sendFarmerApplyLoginMagicLink (request, email, sbi) {
  return sendMagicLinkEmail(request, email, emailTemplates.applyLogin, 'org-review', farmerApply, { sbi })
}

module.exports = {
  sendFarmerApplyLoginMagicLink
}
