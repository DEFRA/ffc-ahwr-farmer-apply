const session = require('../../session')
const { tokens } = require('../../session/keys')
const validateJwt = require('./jwt/validate-jwt')
const { nonceIsValid } = require('../verification')
const { expiryToISODate } = require('./token-expiry')

const setAuthTokens = async (request, response) => {
  try {
    const accessToken = response.data.access_token
    const isTokenValid = await validateJwt(accessToken)

    if (isTokenValid) {
      const idToken = response.data.id_token

      if (!nonceIsValid(request, idToken)) {
        console.log('Nonce returned does not match original nonce.')
        return false
      }

      session.setToken(request, tokens.accessToken, accessToken)

      const tokenExpiry = expiryToISODate(response.data.expires_in)
      session.setToken(request, tokens.tokenExpiry, tokenExpiry)

      session.setToken(request, tokens.idToken, idToken)

      const refreshToken = response.data.refresh_token
      session.setToken(request, tokens.refreshToken, refreshToken)

      // setCookieAuth(request, accessToken)

      console.log('Authentication successful.')

      return true
    }
  } catch (err) {
    console.log('Error validating token: ', err)
  }

  return false
}

module.exports = setAuthTokens
