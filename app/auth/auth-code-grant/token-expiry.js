const session = require('../../session')
const { tokens } = require('../../session/keys')

const hasExpired = (request) => {
  const tokenExpiry = session.getToken(request, tokens.tokenExpiry)
  if (tokenExpiry) {
    const expiryTime = new Date(session.getToken(request, tokens.tokenExpiry)).getTime()
    const currentTime = new Date().getTime()
    return expiryTime < currentTime
  }

  return true
}

module.exports = {
  hasExpired
}
