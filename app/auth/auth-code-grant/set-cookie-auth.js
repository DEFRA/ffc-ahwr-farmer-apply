const session = require('../../session')
const { customer } = require('../../session/keys')
const decodeJwt = require('../token-verify/decode-jwt')
const parseRole = require('../cookie-auth/parse-roles')

const setCookieAuth = (request, accessToken) => {
  const cookieAuth = request.cookieAuth
  const parseAccessToken = decodeJwt(accessToken)

  const { roleNames } = parseRole(parseAccessToken.roles)
  session.setCustomer(request, customer.crn, parseAccessToken.contactId)
  session.setCustomer(request, customer.organisationId, parseAccessToken.currentRelationshipId)

  cookieAuth.set({
    scope: roleNames,
    account: { email: parseAccessToken.email, name: `${parseAccessToken.firstName} ${parseAccessToken.lastName}` }
  })
}

module.exports = setCookieAuth
