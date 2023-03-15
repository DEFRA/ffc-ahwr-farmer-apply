const boom = require('@hapi/boom')
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
        code: Joi.string(),
        state: Joi.string()
      }).options({
        stripUnknown: true
      }),
      failAction (request, h, err) {
        throw boom.badRequest(err)
      }
    },
    handler: async (request, h) => {
      console.log(`code is ${request.query.code}`)
      console.log(`state is ${request.query.state}`)
      const organisation = {
        sbi: '1133333',
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
    }
  }
}
]
