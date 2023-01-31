const urlPrefix = require('../config/index').urlPrefix
const { farmerApplyData: { organisation: organisationKey } } = require('../session/keys')
const { setFarmerApplyData } = require('../session')

module.exports = [{
  method: 'GET',
  path: `${urlPrefix}/select-your-business`,
  options: {
    auth: false,
    handler: async (_, h) => {
      return h.view('select-your-business')
    }
  }
  },
  {
    method: 'POST',
    path: `${urlPrefix}/select-your-business`,
    options: {
      // validate: {
      //   payload: Joi.object({
      //     [confirmCheckDetails]: Joi.string().valid('yes', 'no').required()
      //   }),
      //   failAction: (request, h, _err) => {
      //     const organisation = session.getFarmerApplyData(request, organisationKey)
      //     if (!organisation) {
      //       return boom.notFound()
      //     }
      //     return h.view('org-review', getOrganisation(request, errorMessage)).code(400).takeover()
      //   }
      // },
      handler: async (request, h) => {
        const organisation = {
          'sbi' : '122333',
          "crn" : '112222',
          "email" : "liam.wilson@kainos.com",
          "farmerName" : "Mr Farmer",
          "name" : "My Amazing Farm",
          "address" : "1 Some Road"
        }
        setFarmerApplyData(request, organisationKey, organisation)
        return h.redirect(`${urlPrefix}/org-review`)
      }
    }
  }]
