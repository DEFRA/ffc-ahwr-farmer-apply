const boom = require('@hapi/boom')
const Joi = require('joi')
const session = require('../../session')
const {
  reference,
  declaration,
  offerStatus,
  organisation: organisationKey,
  customer: crn
} = require('../../session/keys').farmerApplyData
const { tempReference } = require('../../session/keys').tempReference
const getDeclarationData = require('../models/declaration')
const { sendApplication } = require('../../messaging/application')
const appInsights = require('applicationinsights')
const { userType } = require('../../constants/user-types')
const applicationType = require('../../constants/application-type')
const config = require('../../config/index')
const { getLatestApplicationsBySbi } = require('../../api-requests/application-api')
const { isUserOldWorldRejectWithinTenMonths, isUserOldWorldReadyToPayWithinTenMonths } = require('../../lib/common-checks')
const {
  endemicsTimings,
  endemicsDeclaration,
  endemicsConfirmation,
  endemicsOfferRejected
} = require('../../config/routes')

const resetFarmerApplyDataBeforeApplication = (application) => {
  application.reference = null // Set application ref to null instead of temp ref before sending it to be processed.
  delete application.agreeSpeciesNumbers
  delete application.agreeSameSpecies
  delete application.agreeVisitTimings
}

module.exports = [
  {
    method: 'GET',
    path: `${config.urlPrefix}/${endemicsDeclaration}`,
    options: {
      handler: async (request, h) => {
        const application = session.getFarmerApplyData(request)
        if (!application) {
          return boom.notFound()
        }
        const viewData = getDeclarationData(application)
        return h.view(endemicsDeclaration, {
          backLink: `${config.urlPrefix}/${endemicsTimings}`,
          latestTermsAndConditionsUri: `${config.latestTermsAndConditionsUri}?continue=true&backLink=${config.urlPrefix}/${endemicsDeclaration}`,
          ...viewData
        })
      }
    }
  },
  {
    method: 'POST',
    path: `${config.urlPrefix}/${endemicsDeclaration}`,
    options: {
      validate: {
        payload: Joi.object({
          offerStatus: Joi.string().required().valid('accepted', 'rejected'),
          terms: Joi.string().when('offerStatus', {
            is: 'accepted',
            then: Joi.valid('agree').required()
          })
        }),
        failAction: async (request, h, _) => {
          const application = session.getFarmerApplyData(request)
          const viewData = getDeclarationData(application)
          return h
            .view(endemicsDeclaration, {
              backLink: `${config.urlPrefix}/${endemicsTimings}`,
              latestTermsAndConditionsUri: `${config.latestTermsAndConditionsUri}?continue=true&backLink=${config.urlPrefix}/${endemicsDeclaration}`,
              errorMessage: {
                text: 'Select you have read and agree to the terms and conditions'
              },
              ...viewData
            })
            .code(400)
            .takeover()
        }
      },
      handler: async (request, h) => {
        let userTypeStatus = {}
        session.setFarmerApplyData(request, declaration, true)
        session.setFarmerApplyData(
          request,
          offerStatus,
          request.payload.offerStatus
        )

        const application = session.getFarmerApplyData(request)
        const tempApplicationReference = application.reference

        resetFarmerApplyDataBeforeApplication(application)

        const resultOfAllApplications = await getLatestApplicationsBySbi(application.organisation.sbi)
        const { isExistingUserRejectedAgreementWithin10months } = isUserOldWorldRejectWithinTenMonths(resultOfAllApplications) || {}
        const { isExistingUserReadyToPayAgreementWithin10months } = isUserOldWorldReadyToPayWithinTenMonths(resultOfAllApplications) || {}
        userTypeStatus = { isExistingUserRejectedAgreementWithin10months, isExistingUserReadyToPayAgreementWithin10months }

        const newApplicationReference = await sendApplication(
          {
            ...application,
            type: applicationType.ENDEMICS,
            oldWorldRejectedAgreement10months: { ...userTypeStatus }
          },
          request.yar.id
        )

        if (newApplicationReference) {
          session.setFarmerApplyData(
            request,
            reference,
            newApplicationReference
          )
          session.setTempReference(
            request,
            tempReference,
            tempApplicationReference
          )

          const organisation = session.getFarmerApplyData(
            request,
            organisationKey
          )
          appInsights.defaultClient.trackEvent({
            name: 'endemics-agreement-created',
            properties: {
              reference: newApplicationReference,
              tempReference: tempApplicationReference,
              sbi: organisation.sbi,
              crn: session.getCustomer(request, crn)
            }
          })
        }

        session.clear(request)
        request.cookieAuth.clear()

        if (request.payload.offerStatus === 'rejected') {
          return h.view(endemicsOfferRejected, {
            offerRejected: true,
            ruralPaymentsAgency: config.ruralPaymentsAgency
          })
        }

        if (!newApplicationReference) {
          console.log(
            'Apply declaration returned a null application reference.'
          )
          throw boom.internal()
        }

        return h.view(endemicsConfirmation, {
          reference: newApplicationReference,
          userTypeStatus,
          isNewUser: userType.NEW_USER === application.organisation.userType && !userTypeStatus.isExistingUserRejectedAgreementWithin10months,
          ruralPaymentsAgency: config.ruralPaymentsAgency,
          applySurveyUri: config.customerSurvey.uri,
          latestTermsAndConditionsUri: config.latestTermsAndConditionsUri
        })
      }
    }
  }
]
