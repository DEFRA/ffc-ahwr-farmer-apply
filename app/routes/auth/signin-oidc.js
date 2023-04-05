const Joi = require('joi')
const session = require('../../session')
const auth = require('../../auth')
const sessionKeys = require('../../session/keys')
const config = require('../../config')
const { farmerApply } = require('../../constants/user-types')
const { getPersonSummary, getPersonName, organisationIsEligible, getOrganisationAddress } = require('../../api-requests/rpa-api')

function setCustomerSessionData (request, personSummary, organisationSummary) {
  session.setCustomer(request, sessionKeys.customer.id, personSummary.id)
  session.setCustomer(request, sessionKeys.customer.crn, personSummary.customerReferenceNumber)
  session.setCustomer(request, sessionKeys.customer.organisationId, organisationSummary.organisation.id)
}

function setOrganisationSessionData (request, personSummary, organisationSummary) {
  const organisation = {
    sbi: organisationSummary.organisation.sbi.toString(),
    farmerName: getPersonName(personSummary),
    name: organisationSummary.organisation.name,
    email: organisationSummary.organisation.email,
    address: getOrganisationAddress(organisationSummary.organisation.address)
  }
  session.setFarmerApplyData(
    request,
    sessionKeys.farmerApplyData.organisation,
    organisation
  )
}

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
          backLink: auth.requestAuthorizationCodeUrl(session, request)
        }).code(400).takeover()
      }
    },
    handler: async (request, h) => {
      try {
        await auth.authenticate(request, session)
        const personSummary = await getPersonSummary(request)
        const organisationSummary = await organisationIsEligible(request, personSummary.id)
        setCustomerSessionData(request, personSummary, organisationSummary)
        setOrganisationSessionData(request, personSummary, organisationSummary)

        auth.setAuthCookie(request, organisationSummary.organisation.email, farmerApply)
        return h.redirect(`${config.urlPrefix}/org-review`)
      } catch (e) {
        console.error(`Error when handling DEFRA ID redirect ${JSON.stringify(e.message)}.`)
        return h.view('verify-login-failed', {
          backLink: auth.requestAuthorizationCodeUrl(session, request)
        }).code(400)
      }
    }
  }
}
]
