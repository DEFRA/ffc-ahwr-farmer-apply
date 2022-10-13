const { getByEmail } = require('../api-requests/users')
const { cookie: cookieConfig, cookiePolicy } = require('../config')
const { getFarmerApplyData, setFarmerApplyData } = require('../session')
const { farmerApplyData: { organisation: organisationKey } } = require('../session/keys')

module.exports = {
  plugin: {
    name: 'auth',
    register: async (server, _) => {
      server.auth.strategy('session', 'cookie', {
        cookie: {
          isSameSite: cookieConfig.isSameSite,
          isSecure: cookieConfig.isSecure,
          name: cookieConfig.cookieNameAuth,
          password: cookieConfig.password,
          path: cookiePolicy.path,
          ttl: cookieConfig.ttl
        },
        keepAlive: true,
        redirectTo: (request) => {
          return '/apply/login'
        },
        validateFunc: async (request, session) => {
          const result = { valid: false }

          if (getFarmerApplyData(request, organisationKey)) {
            result.valid = true
          } else {
            const organisation = (await getByEmail(session.email)) ?? {}
            setFarmerApplyData(request, organisationKey, organisation)
            result.valid = !!organisation
          }

          return result
        }
      })
      server.auth.default({ strategy: 'session', mode: 'required' })
    }
  }
}
