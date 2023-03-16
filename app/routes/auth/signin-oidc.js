const Joi = require('joi')
const session = require('../../session')
const auth = require('../../auth')
const sessionKeys = require('../../session/keys')
const config = require('../../config')
const { farmerApply } = require('../../constants/user-types')

module.exports = [{
  method: 'GET',
  path: `${config.urlPrefix}/signin-oidc`,
  options: {
    auth: false,
    validate: {
      query: Joi.object({
        code: Joi.string().required(),
        state: Joi.string().uuid().required()
      }).options({
        stripUnknown: true
      }),
      failAction (request, h, err) {
        return h.view('verify-login-failed', {
          backLink: config.authConfig.defraId.enabled ? auth.getAuthenticationUrl(session, request) : `${config.urlPrefix}/login`
        }).code(400).takeover()
      }
    },
    handler: async (request, h) => {
      try {
        await auth.authenticate(request, session)
        // todo implement RPA api calls
        // navigate to exception screen or org review
        const organisation = {
          sbi: '113333333',
          farmerName: 'DEFRA ID Placeholder',
          name: 'DEFRA ID Placeholder',
          email: 'dummyemail@email.con',
          address: 'DEFRA ID Placeholder'
        }
        session.setFarmerApplyData(
          request,
          sessionKeys.farmerApplyData.organisation,
          organisation
        )
        auth.setAuthCookie(request, organisation.email, farmerApply)
        return h.redirect(`${config.urlPrefix}/org-review`)
      } catch (e) {
        return h.view('verify-login-failed', {
          backLink: config.authConfig.defraId.enabled ? auth.getAuthenticationUrl(session, request) : `${config.urlPrefix}/login`
        }).code(400)
      }
    }
  }
}
]
