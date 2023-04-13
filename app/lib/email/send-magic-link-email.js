const getToken = require('../auth/get-token')
const sendEmail = require('./send-email')
const { serviceUri } = require('../../config')
const { emailTemplates } = require('../../config').notifyConfig
const { farmerApply } = require('../../constants/user-types')

async function createAndCacheToken (request, email, redirectTo, userType, data) {
  const { magiclinkCache } = request.server.app

  const token = await getToken(email)
  const tokens = await magiclinkCache.get(email) ?? []
  tokens.push(token)

  console.log(`Tokens for email ${email} - ${tokens.length}.`)

  await magiclinkCache.set(email, tokens)
  await magiclinkCache.set(token, { email, redirectTo, userType, data })

  console.log(`Added token ${token} to cache for ${email}.`)
  return token
}

async function sendMagicLinkEmail (request, email, templateId, redirectTo, userType, data) {
  const token = await createAndCacheToken(request, email, redirectTo, userType, data)

  const magicLink = new URL(`${serviceUri}/verify-login`)
  magicLink.searchParams.append('token', token)
  magicLink.searchParams.append('email', email)

  console.log(`Sending magic link ${magicLink.href} to email ${email}`)

  return sendEmail(templateId, email, {
    personalisation: { magiclink: magicLink.href },
    reference: token
  })
}

async function sendFarmerApplyLoginMagicLink (request, email) {
  const redirectTo = 'select-your-business'
  return sendMagicLinkEmail(request, email, emailTemplates.applyLogin, redirectTo, farmerApply)
}

module.exports = {
  sendFarmerApplyLoginMagicLink
}
