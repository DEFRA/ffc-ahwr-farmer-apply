const boom = require('@hapi/boom')
const { organisation: organisationKey, confirmCheckDetails, organisations: organisationsKey } = require('../session/keys').farmerApplyData
const getOrganisations = require('./models/organisations')
const session = require('../session')
const Joi = require('joi')
const urlPrefix = require('../config/index').urlPrefix
const organisationButtonName = 'select-organisation'
const errorMessage = 'Select at least one organisation.'
module.exports = [{
  method: 'GET',
  path: `${urlPrefix}/org-select`,
  options: {
    handler: async (request, h) => {
      const organisation = session.getFarmerApplyData(request, organisationKey)
      if (organisation) {
        return h.redirect(request.query?.next || `${urlPrefix}/org-review`)
      }
      session.getOrganisations(request, organisationsKey)
      if (!organisations) {
        return boom.notFound()
      }
      return h.view('org-select', getOrganisations(request, organisation))
    }
  }
},
{
  method: 'POST',
  path: `${urlPrefix}/org-select`,
  options: {
    validate: {
      payload: Joi.object({
        [organisationButtonName]: Joi.string().required()
      }),
      failAction: (request, h, _err) => {
        const organisation = session.getFarmerApplyData(request, organisationKey)
        if (!organisation) {
          return boom.notFound()
        }
        return h.view('org-select', getOrganisations(request, organisation, errorMessage)).code(400).takeover()
      }
    },
    handler: async (request, h) => {
      const answer = request.payload[organisationButtonName]
      if (answer) {
        const selectedOrganisation = session.getOrganisations(request, organisationsKey).filter(
          o => o.sbi === answer
        )
        session.setFarmerApplyData(
          request,
          selectedOrganisation,
          request.payload[organisationKey]
        )
        return h.redirect(`${urlPrefix}/org-review`)
      }
      return h.view('org-select', getOrganisations(request, organisation, errorMessage)).code(400).takeover()
    }
  }
}]
