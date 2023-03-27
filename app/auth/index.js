const config = require('../config')
const crypto = require('./crypto')
const verification = require('./verification')
const retrieveToken = require('./access-token/retrieve-token')
const setAuthTokens = require('./access-token/set-auth-tokens')

const lookupToken = async (request, token) => {
  const { magiclinkCache } = request.server.app
  return (await magiclinkCache.get(token)) ?? {}
}

const setAuthCookie = (request, email, userType) => {
  request.cookieAuth.set({ email, userType })
  console.log(`Logged in user of type '${userType}' with email '${email}'.`)
}

const getAuthenticationUrl = (session, request, pkce = true) => {
  const authUrl = new URL(`${config.authConfig.defraId.hostname}${config.authConfig.defraId.oAuthAuthorisePath}`)
  authUrl.searchParams.append('p', config.authConfig.defraId.policy)
  authUrl.searchParams.append('client_id', config.authConfig.defraId.clientId)
  authUrl.searchParams.append('nonce', verification.generateNonce(session, request))
  authUrl.searchParams.append('redirect_uri', config.authConfig.defraId.redirectUri)
  authUrl.searchParams.append('scope', config.authConfig.defraId.scope)
  authUrl.searchParams.append('response_type', 'code')
  authUrl.searchParams.append('serviceId', config.authConfig.defraId.serviceId)
  authUrl.searchParams.append('state', verification.generateState(session, request))
  authUrl.searchParams.append('forceReselection', true)

  if (pkce) {
    const challenge = crypto.createCryptoProvider(session, request)
    authUrl.searchParams.append('code_challenge', challenge)
    authUrl.searchParams.append('code_challenge_method', 'S256')
  }

  return authUrl
}

const authenticate = async (request, session) => {
  if (!verification.stateIsValid(session, request)) {
    console.log(`Unable to verify state for request id ${request.yar.id}.`)
    throw new Error('Invalid state')
  } else {
    const refresh = false
    const response = await retrieveToken(request, refresh)
    if (typeof response === 'undefined') {
      throw new Error('Unretrieved token')
    }
    const authSuccessful = await setAuthTokens(request, response)
    if (!authSuccessful) {
      throw new Error('Invalid token')
    }
    return response.access_token
  }
}

module.exports = {
  lookupToken,
  setAuthCookie,
  getAuthenticationUrl,
  authenticate
}
