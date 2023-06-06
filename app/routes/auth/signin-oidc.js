const Joi = require('joi')
const session = require('../../session')
const auth = require('../../auth')
const sessionKeys = require('../../session/keys')
const config = require('../../config')
const { farmerApply } = require('../../constants/user-types')
const { getPersonSummary, getPersonName, organisationIsEligible, getOrganisationAddress, cphCheck } = require('../../api-requests/rpa-api')
const businessEligibleToApply = require('../../api-requests/business-eligble-to-apply')
const { InvalidPermissionsError, AlreadyAppliedError, NoEligibleCphError, InvalidStateError } = require('../../exceptions')
const { raiseIneligibilityEvent } = require('../../event')

function setOrganisationSessionData (request, personSummary, organisationSummary) {
  const organisation = {
    sbi: organisationSummary.organisation.sbi?.toString(),
    farmerName: getPersonName(personSummary),
    name: organisationSummary.organisation.name,
    email: personSummary.email ? personSummary.email : organisationSummary.organisation.email,
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
          backLink: auth.requestAuthorizationCodeUrl(session, request),
          ruralPaymentsAgency: config.ruralPaymentsAgency
        }).code(400).takeover()
      }
    },
    handler: async (request, h) => {
      try {
        await auth.authenticate(request, session)

        const apimAccessToken = await auth.retrieveApimAccessToken()

        const personSummary = await getPersonSummary(request, apimAccessToken)
        session.setCustomer(request, sessionKeys.customer.id, personSummary.id)

        const organisationSummary = await organisationIsEligible(request, personSummary.id, apimAccessToken)
        setOrganisationSessionData(request, personSummary, organisationSummary)

        if (!organisationSummary.organisationPermission) {
          throw new InvalidPermissionsError(`Person id ${personSummary.id} does not have the required permissions for organisation id ${organisationSummary.organisation.id}`)
        }

        await cphCheck.customerMustHaveAtLeastOneValidCph(request, apimAccessToken)

        const businessCanApply = await businessEligibleToApply(organisationSummary.organisation.sbi)

        if (!businessCanApply) {
          throw new AlreadyAppliedError(`Business with SBI ${organisationSummary.organisation.sbi} is not eligble to apply`)
        }

        auth.setAuthCookie(request, personSummary.email, farmerApply)
        return h.redirect(`${config.urlPrefix}/org-review`)
      } catch (err) {
        console.error(`Received error with name ${err.name} and message ${err.message}.`)
        const attachedToMultipleBusinesses = session.getCustomer(request, sessionKeys.customer.attachedToMultipleBusinesses)
        const organisation = session.getFarmerApplyData(request, sessionKeys.farmerApplyData.organisation)
        const crn = session.getCustomer(request, sessionKeys.customer.crn)
        switch (true) {
          case err instanceof InvalidStateError:
            return h.redirect(auth.requestAuthorizationCodeUrl(session, request))
          case err instanceof AlreadyAppliedError:
          case err instanceof InvalidPermissionsError:
          case err instanceof NoEligibleCphError:
            break
          default:
            return h.view('verify-login-failed', {
              backLink: auth.requestAuthorizationCodeUrl(session, request),
              ruralPaymentsAgency: config.ruralPaymentsAgency
            }).code(400).takeover()
        }
        raiseIneligibilityEvent(
          request.yar.id,
          organisation?.sbi,
          crn,
          organisation?.email,
          err.name
        )
        return h.view('defra-id/cannot-apply-for-livestock-review-exception', {
          ruralPaymentsAgency: config.ruralPaymentsAgency,
          alreadyAppliedError: err instanceof AlreadyAppliedError,
          permissionError: err instanceof InvalidPermissionsError,
          cphError: err instanceof NoEligibleCphError,
          hasMultipleBusineses: attachedToMultipleBusinesses,
          backLink: auth.requestAuthorizationCodeUrl(session, request),
          sbiText: organisation?.sbi !== undefined ? ` - SBI ${organisation.sbi}` : null,
          organisationName: organisation?.name,
          guidanceLink: config.serviceUri
        }).code(400).takeover()
      }
    }
  }
}
]
