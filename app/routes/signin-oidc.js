const Joi = require('joi')
const session = require('../session')
const auth = require('../auth')
const sessionKeys = require('../session/keys')
const config = require('../config')
const { farmerApply } = require('../constants/user-types')
const { getPersonSummary, getPersonName, organisationIsEligible, getOrganisationAddress, cphCheck } = require('../api-requests/rpa-api')
const businessEligibleToApply = require('../api-requests/business-eligible-to-apply')
const { InvalidPermissionsError, AlreadyAppliedError, NoEligibleCphError, InvalidStateError, CannotReapplyTimeLimitError, OutstandingAgreementError } = require('../exceptions')
const { raiseIneligibilityEvent } = require('../event')
const appInsights = require('applicationinsights')

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
        state: Joi.string().required()
      }).options({
        stripUnknown: true
      }),
      failAction (request, h, err) {
        console.log(`Validation error caught during DEFRA ID redirect - ${err.message}.`)
        appInsights.defaultClient.trackException({ exception: err })
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

        await businessEligibleToApply(organisationSummary.organisation.sbi)

        auth.setAuthCookie(request, personSummary.email, farmerApply)
        appInsights.defaultClient.trackEvent({
          name: 'login',
          properties: {
            sbi: organisationSummary.organisation.sbi,
            crn: session.getCustomer(request, sessionKeys.customer.crn),
            email: personSummary.email
          }
        })
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
            break
          case err instanceof InvalidPermissionsError:
            break
          case err instanceof NoEligibleCphError:
            break
          case err instanceof CannotReapplyTimeLimitError:
            break
          case err instanceof OutstandingAgreementError:
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
        return h.view('cannot-apply-for-livestock-review-exception', {
          ruralPaymentsAgency: config.ruralPaymentsAgency,
          alreadyAppliedError: err instanceof AlreadyAppliedError,
          permissionError: err instanceof InvalidPermissionsError,
          cphError: err instanceof NoEligibleCphError,
          reapplyTimeLimitError: err instanceof CannotReapplyTimeLimitError,
          outstandingAgreementError: err instanceof OutstandingAgreementError,
          lastApplicationDate: err.lastApplicationDate,
          nextApplicationDate: err.nextApplicationDate,
          hasMultipleBusinesses: attachedToMultipleBusinesses,
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
