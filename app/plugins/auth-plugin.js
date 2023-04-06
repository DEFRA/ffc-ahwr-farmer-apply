const { getByEmail } = require('../api-requests/users')
const config = require('../config')
const auth = require('../auth')
const session = require('../session')
const { farmerApplyData: { organisation: organisationKey } } = require('../session/keys')

module.exports = {
  plugin: {
    name: 'auth',
    register: async (server, _) => {
      server.auth.strategy('session', 'cookie', {
        cookie: {
          isSameSite: config.cookie.isSameSite,
          isSecure: config.cookie.isSecure,
          name: config.cookie.cookieNameAuth,
          password: config.cookie.password,
          path: config.cookiePolicy.path,
          ttl: config.cookie.ttl
        },
        keepAlive: true,
        redirectTo: (request) => {
          return config.authConfig.defraId.enabled ? auth.requestAuthorizationCodeUrl(session, request) : '/apply/login'
        },
        validateFunc: async (request, s) => {
          const result = { valid: false }

          if (session.getFarmerApplyData(request, organisationKey)) {
            result.valid = true
          } else {
            const organisation = (await getByEmail(s.email)) ?? {}
            result.valid = !!organisation
          }

          return result
        }
      })
      server.auth.default({ strategy: 'session', mode: 'required' })
    }
  }
}
