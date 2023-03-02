const config = require('../config')
const BUSINESS_EMAIL_SCHEMA = require('../schemas/business-email.schema.js')
const getSignedJwt = require('../lib/auth/get-signed-jwt')
const Wreck = require('@hapi/wreck')

async function getMagicLink (businessEmail) {
  try {
    businessEmail = BUSINESS_EMAIL_SCHEMA.validate(businessEmail)
    if (businessEmail.error) {
      throw new Error(`Invalid business email: ${businessEmail.value} returned an error: ${businessEmail.error}`)
    }

    const templateId = config.notifyConfig.emailTemplates.applyLogin
    const signedJwt = getSignedJwt()

    if (signedJwt === null) {
      throw new Error('Unable to sign JWT')
    }

    const options = {
      headers: {
        Authorization: `Bearer ${signedJwt}`,
        'Content-Type': 'application/json'
      },
      json: true
    }

    const response = await Wreck.get('https://api.notifications.service.gov.uk/v2/notifications', options)

    if (response.res.statusCode !== 200) {
      throw new Error(`HTTP ${response.res.statusCode} (${response.res.statusMessage}). The response was: ${JSON.stringify(response.payload)}`)
    }

    const latestEmail = response.payload.notifications.filter(notification => notification.template.id === templateId)
      .filter(notification => notification.email_address === businessEmail.value)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    if (latestEmail.length === 0) {
      throw new Error(`No magic link email found for ${businessEmail.value}`)
    }

    const token = latestEmail[0].reference
    if (token === null || token === undefined) {
      throw new Error(`Unable to find token in magic link email for ${businessEmail.value}`)
    }

    const magicLink = `${config.serviceUri}/verify-login?token=${token}&email=${businessEmail.value}`

    console.log(`${new Date().toISOString()} Magic link for ${businessEmail.value} is ${magicLink}`)
    return magicLink
  } catch (error) {
    console.log(`${new Date().toISOString()} Error retrieving magic link: ${error.message}`)
    return null
  }
}

module.exports = getMagicLink
