const jwt = require('jsonwebtoken')

module.exports = function decodeJwt (token) {
  const decodedToken = jwt.decode(token, { complete: true })
  if (!decodedToken) {
    console.log('Token decode failed.')
    return {}
  }

  return decodedToken.payload
}
