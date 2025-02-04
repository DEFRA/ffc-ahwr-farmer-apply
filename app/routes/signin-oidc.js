import joi from 'joi'
import { keys } from '../session/keys.js'
import { config } from '../config/index.js'
import appInsights from 'applicationinsights'
import { getCustomer, getFarmerApplyData, setCustomer, setFarmerApplyData } from '../session/index.js'
import { requestAuthorizationCodeUrl } from '../auth/auth-code-grant/request-authorization-code-url.js'
import { authenticate } from '../auth/authenticate.js'
import { retrieveApimAccessToken } from '../auth/client-credential-grant/retrieve-apim-access-token.js'
import { generateRandomID } from '../lib/create-temp-reference.js'

import { getOrganisationAddress, organisationIsEligible } from '../api-requests/rpa-api/organisation.js'
import { getPersonName, getPersonSummary } from '../api-requests/rpa-api/person.js'
import { customerMustHaveAtLeastOneValidCph } from '../api-requests/rpa-api/cph-check.js'
import { businessEligibleToApply } from '../api-requests/business-eligible-to-apply.js'
import { setAuthCookie } from '../auth/cookie-auth/cookie-auth.js'
import { farmerApply } from '../constants/constants.js'
import { getIneligibilityEvent } from '../event/get-ineligibility-event.js'
import { raiseEvent } from '../event/raise-event.js'

import { InvalidPermissionsError } from '../exceptions/InvalidPermissionsError.js'
import { AlreadyAppliedError } from '../exceptions/AlreadyAppliedError.js'
import { NoEligibleCphError } from '../exceptions/NoEligibleCphError.js'
import { InvalidStateError } from '../exceptions/InvalidStateError.js'
import { CannotReapplyTimeLimitError } from '../exceptions/CannotReapplyTimeLimitError.js'
import { OutstandingAgreementError } from '../exceptions/OutstandingAgreementError.js'
import { LockedBusinessError } from '../exceptions/LockedBusinessError.js'

function setOrganisationSessionData (request, personSummary, { organisation: org }, crn) {
  const organisation = {
    sbi: org.sbi?.toString(),
    farmerName: getPersonName(personSummary),
    name: org.name,
    email: personSummary.email ? personSummary.email : org.email,
    orgEmail: org.email,
    address: getOrganisationAddress(org.address),
    crn,
    frn: org.businessReference
  }
  setFarmerApplyData(
    request,
    keys.farmerApplyData.organisation,
    organisation
  )
}

export const signinRouteHandlers = [{
  method: 'GET',
  path: `${config.urlPrefix}/signin-oidc`,
  options: {
    auth: false,
    validate: {
      query: joi.object({
        code: joi.string().required(),
        state: joi.string().required()
      }).options({
        stripUnknown: true
      }),
      failAction (request, h, err) {
        request.logger.warn(err, 'signin oidc')
        appInsights.defaultClient.trackException({ exception: err })
        return h.view('verify-login-failed', {
          backLink: requestAuthorizationCodeUrl(request),
          ruralPaymentsAgency: config.ruralPaymentsAgency
        }).code(400).takeover()
      }
    },
    handler: async (request, h) => {
      let tempApplicationId
      try {
        tempApplicationId = generateRandomID()
        request.logger.setBindings({ tempApplicationId })
        // tempApplicationId added to reference to enable session event to report with temp id
        setFarmerApplyData(request, keys.farmerApplyData.reference, tempApplicationId)
        await authenticate(request)
        request.logger.setBindings({ authenticated: true })
        const apimAccessToken = await retrieveApimAccessToken()

        const personSummary = await getPersonSummary(request, apimAccessToken)
        setCustomer(request, keys.customer.id, personSummary.id)
        const organisationSummary = await organisationIsEligible(request, personSummary.id, apimAccessToken)

        request.logger.setBindings({ sbi: organisationSummary.organisation.sbi })

        const crn = getCustomer(request, keys.customer.crn)
        setOrganisationSessionData(request, personSummary, { ...organisationSummary }, crn)

        if (organisationSummary.organisation.locked) {
          throw new LockedBusinessError(`Organisation id ${organisationSummary.organisation.id} is locked by RPA`)
        }

        if (!organisationSummary.organisationPermission) {
          throw new InvalidPermissionsError(`Person id ${personSummary.id} does not have the required permissions for organisation id ${organisationSummary.organisation.id}`)
        }

        await customerMustHaveAtLeastOneValidCph(request, apimAccessToken)
        const previousApplication = await businessEligibleToApply(organisationSummary.organisation.sbi)

        request.logger.setBindings({ previousApplication })

        setAuthCookie(request, personSummary.email, farmerApply)
        appInsights.defaultClient.trackEvent({
          name: 'login',
          properties: {
            reference: tempApplicationId,
            sbi: organisationSummary.organisation.sbi,
            crn,
            email: personSummary.email
          }
        })
        return h.redirect(`${config.urlPrefix}/endemics/check-details`)
      } catch (err) {
        request.logger.error(err, 'check details')

        const attachedToMultipleBusinesses = getCustomer(request, keys.customer.attachedToMultipleBusinesses)
        const organisation = getFarmerApplyData(request, keys.farmerApplyData.organisation)
        const crn = getCustomer(request, keys.customer.crn)
        switch (true) {
          case err instanceof InvalidStateError:
            appInsights.defaultClient.trackEvent({
              name: 'invalid-state-error',
              properties: {
                reference: tempApplicationId
              }
            })
            return h.redirect(requestAuthorizationCodeUrl(request))
          case err instanceof AlreadyAppliedError:
            appInsights.defaultClient.trackEvent({
              name: 'already-applied-error',
              properties: {
                reference: tempApplicationId,
                sbi: organisation.sbi,
                crn: getCustomer(request, keys.customer.crn)
              }
            })
            break
          case err instanceof InvalidPermissionsError:
            appInsights.defaultClient.trackEvent({
              name: 'invalid-permission-error',
              properties: {
                reference: tempApplicationId,
                sbi: organisation.sbi,
                crn: getCustomer(request, keys.customer.crn)
              }
            })
            break
          case err instanceof LockedBusinessError:
            break
          case err instanceof NoEligibleCphError:
            appInsights.defaultClient.trackEvent({
              name: 'not-eligible-cph-error',
              properties: {
                reference: tempApplicationId,
                sbi: organisation.sbi,
                crn: getCustomer(request, keys.customer.crn)
              }
            })
            break
          case err instanceof CannotReapplyTimeLimitError:
            appInsights.defaultClient.trackEvent({
              name: 'can-not-reapply-error',
              properties: {
                reference: tempApplicationId,
                sbi: organisation.sbi,
                crn: getCustomer(request, keys.customer.crn)
              }
            })
            break
          case err instanceof OutstandingAgreementError:
            appInsights.defaultClient.trackEvent({
              name: 'outstanding-agreement-error',
              properties: {
                reference: tempApplicationId,
                sbi: organisation.sbi,
                crn: getCustomer(request, keys.customer.crn)
              }
            })
            break
          default:
            appInsights.defaultClient.trackException({ exception: err })
            return h.view('verify-login-failed', {
              backLink: requestAuthorizationCodeUrl(request),
              ruralPaymentsAgency: config.ruralPaymentsAgency
            }).code(400).takeover()
        }

        const event = getIneligibilityEvent(
          request.yar.id,
          organisation.sbi,
          crn,
          organisation.email,
          err.name,
          tempApplicationId
        )
        raiseEvent(event, request.logger)
        raiseEvent({ ...event, name: 'send-session-event' }, request.logger)

        return h.view('cannot-apply-for-livestock-review-exception', {
          ruralPaymentsAgency: config.ruralPaymentsAgency,
          alreadyAppliedError: err instanceof AlreadyAppliedError,
          permissionError: err instanceof InvalidPermissionsError,
          cphError: err instanceof NoEligibleCphError,
          lockedBusinessError: err instanceof LockedBusinessError,
          reapplyTimeLimitError: err instanceof CannotReapplyTimeLimitError,
          outstandingAgreementError: err instanceof OutstandingAgreementError,
          lastApplicationDate: err.lastApplicationDate,
          nextApplicationDate: err.nextApplicationDate,
          hasMultipleBusinesses: attachedToMultipleBusinesses,
          backLink: requestAuthorizationCodeUrl(request),
          claimLink: config.claimServiceUri,
          sbiText: organisation?.sbi !== undefined ? `SBI ${organisation.sbi}` : null,
          organisationName: organisation?.name,
          guidanceLink: config.serviceUri
        }).code(400).takeover()
      }
    }
  }
}
]
