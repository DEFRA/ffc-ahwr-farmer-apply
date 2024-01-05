const Joi = require('joi')
const boom = require('@hapi/boom')
const config = require('../../config')
const session = require('../../session')
const { organisation: organisationKey, confirmCheckDetails } = require('../../session/keys').farmerApplyData
const getOrganisation = require('../models/organisation')

const errorMessage = 'Select yes if these details are correct'

module.exports = [{
  method: 'GET',
  path: `${config.urlPrefix}/endemics/org-review`,
  options: {
    handler: async (request, h) => {
      const organisation = session.getFarmerApplyData(request, organisationKey)
      if (!organisation) {
        return boom.notFound()
      }
      return h.view('endemics/org-review', getOrganisation(request, organisation))
    }
  }
},
{
  method: 'POST',
  path: `${config.urlPrefix}/endemics/org-review`,
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
        return h.view('endemics/org-review', getOrganisation(request, organisation, errorMessage)).code(400).takeover()
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
        return h.redirect(`${config.urlPrefix}/endemics/check-your-eligible`)
      }
      return h.view('update-details', {
        ruralPaymentsAgency: config.ruralPaymentsAgency,
        endemics: true
      })
    }
  }
}]
