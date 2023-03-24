const FormData = require('form-data')
const config = require('../../config').authConfig
const { getVerifier } = require('../crypto')
const session = require('../../session')
const { tokens } = require('../../session/keys')

const buildFormData = () => {
  const data = new FormData()
  data.append('client_id', config.defraId.clientId)
  data.append('client_secret', config.defraId.clientSecret)
  data.append('scope', config.defraId.scope)

  return data
}

const buildAuthFormData = (request, pkce = true) => {
  const redirectCode = request.query.code
  const data = buildFormData()
  data.append('code', redirectCode)
  data.append('grant_type', 'authorization_code')
  data.append('redirect_uri', config.defraId.redirectUri)

  if (pkce) {
    data.append('code_verifier', getVerifier(session, request))
  }
  return data
}

const buildRefreshFormData = (request) => {
  const refreshToken = session.getToken(request, tokens.refreshToken)
  const data = buildFormData()
  data.append('refresh_token', refreshToken)
  data.append('grant_type', 'refresh_token')
  data.append('redirect_uri', config.defraId.redirectUrl)

  return data
}

const buildSignoutFormData = (request) => {
  const signoutToken = session.getToken(request, tokens.idToken)

  const data = new FormData()
  data.append('post_logout_redirect_uri', 'https://localhost:3000')
  data.append('id_token_hint', signoutToken)

  return data
}

module.exports = {
  buildAuthFormData,
  buildRefreshFormData,
  buildSignoutFormData
}
