const cookieAuth = require('./cookie-auth/cookie-auth')

module.exports = {
  requestAuthorizationCodeUrl: require('./auth-code-grant/request-authorization-code-url'),
  authenticate: require('./authenticate'),
  setAuthCookie: cookieAuth.setAuthCookie,
  retrieveApimAccessToken: require('./client-credential-grant/retrieve-apim-access-token')
}
