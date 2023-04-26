const Joi = require('joi')
const session = require('../../session')
const auth = require('../../auth')
const sessionKeys = require('../../session/keys')
const config = require('../../config')
const { farmerApply } = require('../../constants/user-types')
const { getPersonSummary, getPersonName, organisationIsEligible, getOrganisationAddress, cphCheck } = require('../../api-requests/rpa-api')
const businessEligibleToApply = require('../../api-requests/business-eligble-to-apply')
const { InvalidPermissionsError, AlreadyAppliedError, NoEligibleCphError } = require('../../exceptions')

function setOrganisationSessionData (request, personSummary, organisationSummary) {
  const organisation = {
    sbi: organisationSummary.organisation.sbi.toString(),
    farmerName: getPersonName(personSummary),
    name: organisationSummary.organisation.name,
    email: organisationSummary.organisation.email ? organisationSummary.organisation.email : personSummary.email,
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
        console.log(`Validation error caught during DEFRA ID redirect - ${err.message}.`)
        return h.view('verify-login-failed', {
          backLink: auth.requestAuthorizationCodeUrl(session, request)
        }).code(400).takeover()
      }
    },
    handler: async (request, h) => {
      try {
        await auth.authenticate(request, session)

        const apimAccessToken = await auth.getClientCredentials(request)

        const personSummary = await getPersonSummary(request, apimAccessToken)
        session.setCustomer(request, sessionKeys.customer.id, personSummary.id)

        const organisationSummary = await organisationIsEligible(request, personSummary.id, apimAccessToken)
        setOrganisationSessionData(request, personSummary, organisationSummary)

        await cphCheck.customerMustHaveAtLeastOneValidCph(request, apimAccessToken)

        const businessCanApply = await businessEligibleToApply(organisationSummary.organisation.sbi)

        if (!businessCanApply) {
          throw new AlreadyAppliedError(`Business with SBI ${organisationSummary.organisation.sbi} is not eligble to apply`)
        }

        if (!organisationSummary.organisationPermission) {
          throw new InvalidPermissionsError(`Person id ${personSummary.id} does not have the required permissions for organisation id ${organisationSummary.organisation.id}`)
        }

        auth.setAuthCookie(request, personSummary.email, farmerApply)
        return h.redirect(`${config.urlPrefix}/org-review`)
      } catch (err) {
        console.error(`Received error with name ${err.name} and message ${err.message}.`)
        if (err instanceof AlreadyAppliedError || err instanceof InvalidPermissionsError || err instanceof NoEligibleCphError) {
          const attachedToMultipleBusinesses = session.getCustomer(request, sessionKeys.customer.attachedToMultipleBusinesses)
          const organisation = session.getFarmerApplyData(request, sessionKeys.farmerApplyData.organisation)

          return h.view('defra-id/cannot-apply-for-livestock-review-exception', {
            ruralPaymentsAgency: config.ruralPaymentsAgency,
            alreadyAppliedError: err instanceof AlreadyAppliedError,
            permissionError: err instanceof InvalidPermissionsError,
            cphError: err instanceof NoEligibleCphError,
            hasMultipleBusineses: attachedToMultipleBusinesses,
            backLink: auth.requestAuthorizationCodeUrl(session, request),
            sbi: organisation?.sbi,
            organisationName: organisation?.name
          }).code(400).takeover()
        }

        return h.view('verify-login-failed', {
          backLink: auth.requestAuthorizationCodeUrl(session, request)
        }).code(400).takeover()
      }
    }
  }
}
]
