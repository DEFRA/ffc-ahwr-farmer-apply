import { InvalidStateError } from '../exceptions/InvalidStateError.js'
import { verify as verifyState } from './auth-code-grant/state.js'
import { verify as verifyNonce } from './id-token/nonce.js'
import { jwtVerify } from './token-verify/jwt-verify.js'
import { decodeJwt } from './token-verify/jwt-decode.js'
import { toISOString } from './auth-code-grant/expires-in.js'
import { jwtVerifyIss } from './token-verify/jwt-verify-iss.js'
import { redeemAuthorizationCodeForAccessToken } from './auth-code-grant/redeem-authorization-code-for-access-token.js'
import { setCustomer, setToken } from '../session/index.js'
import { set as setCookieAuth } from './cookie-auth/cookie-auth.js'
import { keys } from '../session/keys.js'

export const authenticate = async (request) => {
  if (!verifyState(request)) {
    throw new InvalidStateError('Invalid state')
  }
  const redeemResponse = await redeemAuthorizationCodeForAccessToken(request)
  await jwtVerify(redeemResponse.access_token)
  const accessToken = decodeJwt(redeemResponse.access_token)
  const idToken = decodeJwt(redeemResponse.id_token)
  request.logger.setBindings({ iss: accessToken.iss })
  await jwtVerifyIss(accessToken.iss)
  verifyNonce(request, idToken)

  setToken(request, keys.tokens.accessToken, redeemResponse.access_token)
  setToken(request, keys.tokens.tokenExpiry, toISOString(redeemResponse.expires_in))
  setCustomer(request, keys.customer.crn, accessToken.contactId)
  setCustomer(request, keys.customer.organisationId, accessToken.currentRelationshipId)
  setCustomer(request, keys.customer.attachedToMultipleBusinesses, typeof accessToken.enrolmentCount !== 'undefined' && accessToken.enrolmentCount > 1)

  setCookieAuth(request, accessToken)

  return accessToken
}
