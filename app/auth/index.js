const config = require('../config')
const crypto = require('crypto')
const { v4: uuidv4 } = require('uuid')

const lookupToken = async (request, token) => {
  const { magiclinkCache } = request.server.app
  return (await magiclinkCache.get(token)) ?? {}
}

const setAuthCookie = (request, email, userType) => {
  request.cookieAuth.set({ email, userType })
  console.log(`Logged in user of type '${userType}' with email '${email}'.`)
}

// todo move to different directory
const generateNonce = (session, request) => {
  const nonce = uuidv4()
  // session.setToken(request, tokens.nonce, nonce)
  return nonce
}

// todo move to different directory
const generateState = (session, request) => {
  const state = uuidv4()
  // session.setToken(request, tokens.state, state)
  return state
}

// todo move to crypto folder
const createCryptoProvider = (request) => {
  const verifier = base64URLEncode(crypto.randomBytes(32))
  const challenge = base64URLEncode(sha256(verifier))
  // session.setPkcecodes(request, pkcecodes.verifier, verifier)
  return challenge
}

// todo move to crypto folder
const sha256 = (buffer) => {
  return crypto.createHash('sha256').update(buffer).digest()
}

const base64URLEncode = (str) => {
  return str.toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')
}

const getAuthenticationUrl = (session, request, pkce = true) => {
  const authUrl = new URL(`${config.defraId.tenant}${config.defraId.oAuthAuthorisePath}`)
  authUrl.searchParams.append('p', config.defraId.method)
  authUrl.searchParams.append('client_id', config.defraId.clientId)
  authUrl.searchParams.append('nonce', generateNonce(session, request))
  authUrl.searchParams.append('redirect_uri', config.defraId.redirectUri)
  authUrl.searchParams.append('scope', config.defraId.scope)
  authUrl.searchParams.append('response_type', 'code')
  authUrl.searchParams.append('serviceId', config.defraId.serviceId)
  authUrl.searchParams.append('state', generateState(session, request))
  authUrl.searchParams.append('forceReselection', true)

  if (pkce) {
    const challenge = createCryptoProvider(request)
    authUrl.searchParams.append('code_challenge', challenge)
    authUrl.searchParams.append('code_challenge_method', 'S256')
  }

  return authUrl
}

module.exports = {
  lookupToken,
  setAuthCookie,
  getAuthenticationUrl
}
