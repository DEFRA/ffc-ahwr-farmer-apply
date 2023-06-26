const boom = require('@hapi/boom')
const { organisation: organisationKey, confirmCheckDetails } = require('../session/keys').farmerApplyData
const getOrganisation = require('./models/organisation')
const session = require('../session')
const Joi = require('joi')
const errorMessage = 'Select yes if these details are correct'
const config = require('../config')

module.exports = [{
  method: 'GET',
  path: `${config.urlPrefix}/org-review`,
  options: {
    handler: async (request, h) => {
      const organisation = session.getFarmerApplyData(request, organisationKey)
      if (!organisation) {
        return boom.notFound()
      }
      return h.view('org-review', getOrganisation(request, organisation))
    }
  }
},
{
  method: 'POST',
  path: `${config.urlPrefix}/org-review`,
  options: {
    validate: {
      payload: Joi.object({
        [confirmCheckDetails]: Joi.string().valid('yes', 'no').required()
      }),
      failAction: (request, h, _err) => {
        const organisation = session.getFarmerApplyData(request, organisationKey)
        if (!organisation) {
          return boom.notFound()
        }
        return h.view('org-review', getOrganisation(request, organisation, errorMessage)).code(400).takeover()
      }
    },
    handler: async (request, h) => {
      const answer = request.payload[confirmCheckDetails]
      if (answer === 'yes') {
        session.setFarmerApplyData(
          request,
          confirmCheckDetails,
          request.payload[confirmCheckDetails]
        )
        return h.redirect(`${config.urlPrefix}/which-review`)
      }
      return h.view('update-details', {
        ruralPaymentsAgency: config.ruralPaymentsAgency
      })
    }
  }
}]
