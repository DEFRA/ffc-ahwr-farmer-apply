const parseRoles = require('./parse-roles')

const set = (request, accessToken) => {
  request.cookieAuth.set({
    scope: parseRoles(accessToken.roles),
    account: {
      email: accessToken.email,
      name: `${accessToken.firstName} ${accessToken.lastName}`
    }
  })
}

const setAuthCookie = (request, email, userType) => {
  request.cookieAuth.set({ email, userType })
  request.logger.info({ userType }, 'logged in user')
}

module.exports = {
  set,
  setAuthCookie
}
