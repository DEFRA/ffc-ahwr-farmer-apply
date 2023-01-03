const { getByEmail } = require('../api-requests/users')
const { cookie: cookieConfig, cookiePolicy } = require('../config')
const { getFarmerApplyData, setFarmerApplyData, setOrganisations } = require('../session')
const { farmerApplyData: { organisation: organisationKey }, organisations: organisationsKey } = require('../session/keys')

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
            const organisations = (await getByEmail(session.email)) ?? {}
            if (organisations.length === 1) {
              setFarmerApplyData(request, organisationKey, organisations[0])
            } else {
              setOrganisations(request, organisationsKey, organisations)
            }
            result.valid = !!organisations
          }

          return result
        }
      })
      server.auth.default({ strategy: 'session', mode: 'required' })
    }
  }
}
