const Wreck = require('@hapi/wreck')
const jwktopem = require('jwk-to-pem')
const jwt = require('jsonwebtoken')
const decodeToken = require('./decode-jwt')
const trustedIssuers = require('../trusted-issuers/trusted-issuers')
const config = require('../../../config').authConfig

const retrieveKey = async () => {
  const response = await Wreck.get(
    `${config.defraId.hostname}/discovery/v2.0/keys?p=b2c_1a_signupsignin`,
    { json: true }
  )
  return response.payload.keys[0]
}

const verifyToken = async (token) => {
  const jwk = await retrieveKey()
  const publicKey = jwktopem(jwk)
  const decoded = await jwt.verify(token, publicKey, { algorithms: ['RS256'], ignoreNotBefore: true })

  if (!decoded) {
    console.log('Token is invalid')
    return false
  }

  return true
}

const validateJwt = async (token) => {
  const decodedToken = decodeToken(token)

  if (Object.keys(decodedToken).length === 0) {
    console.log('Token decode failed.')
    return false
  }

  if (!trustedIssuers.includes(decodedToken.iss)) {
    console.log('Token issuer not trusted.')
    return false
  }

  return verifyToken(token)
}

module.exports = validateJwt
