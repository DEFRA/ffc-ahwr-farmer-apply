const session = require('../../session')
const { tokens } = require('../../session/keys')

const expiryToISODate = (expiresIn) => {
  const now = new Date()
  now.setSeconds(now.getSeconds() + expiresIn)
  return now.toISOString()
}

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
  expiryToISODate,
  hasExpired
}
