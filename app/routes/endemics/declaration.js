const boom = require('@hapi/boom')
const Joi = require('joi')
const session = require('../../session')
const { reference, declaration, offerStatus, organisation: organisationKey, customer: crn } = require('../../session/keys').farmerApplyData
const { tempReference } = require('../../session/keys').tempReference
const getDeclarationData = require('../models/declaration')
const { sendApplication } = require('../../messaging/application')
const appInsights = require('applicationinsights')
const { userType } = require('../../constants/user-types')
const applicationType = require('../../constants/application-type')
const config = require('../../config/index')
const {
  endemicsTimings,
  endemicsDeclaration,
  endemicsConfirmation,
  endemicsOfferRejected
} = require('../../config/routes')

const resetFarmerApplyDataBeforeApplication = (application) => {
  // we are no longer nulling the reference as backend needs it with new reference mechanism. have not changed any tests to go with this - so comforting to see that no tests break now - not!
  // NOTE AHWR-426 investigate why these aren't being stored in the database
  delete application.agreeSpeciesNumbers
  delete application.agreeSameSpecies
  delete application.agreeMultipleSpecies
  delete application.agreeVisitTimings
}

module.exports = [{
  method: 'GET',
  path: `${config.urlPrefix}/${endemicsDeclaration}`,
  options: {
    handler: async (request, h) => {
      const application = session.getFarmerApplyData(request)
      if (!application) {
        return boom.notFound()
      }
      const viewData = getDeclarationData(application)
      return h.view(endemicsDeclaration, { backLink: `${config.urlPrefix}/${endemicsTimings}`, latestTermsAndConditionsUri: `${config.latestTermsAndConditionsUri}?continue=true&backLink=${config.urlPrefix}/${endemicsDeclaration}`, ...viewData })
    }
  }
}, {
  method: 'POST',
  path: `${config.urlPrefix}/${endemicsDeclaration}`,
  options: {
    validate: {
      payload: Joi.object({
        offerStatus: Joi.string().required().valid('accepted', 'rejected'),
        terms: Joi.string().when('offerStatus', { is: 'accepted', then: Joi.valid('agree').required() })
      }),
      failAction: async (request, h, _) => {
        const application = session.getFarmerApplyData(request)
        const viewData = getDeclarationData(application)
        return h.view(endemicsDeclaration, {
          backLink: `${config.urlPrefix}/${endemicsTimings}`,
          latestTermsAndConditionsUri: `${config.latestTermsAndConditionsUri}?continue=true&backLink=${config.urlPrefix}/${endemicsDeclaration}`,
          errorMessage: { text: 'Select you have read and agree to the terms and conditions' },
          ...viewData
        }).code(400).takeover()
      }
    },
    handler: async (request, h) => {
      session.setFarmerApplyData(request, declaration, true)
      session.setFarmerApplyData(request, offerStatus, request.payload.offerStatus)

      const application = session.getFarmerApplyData(request)
      const tempApplicationReference = application.reference

      request.logger.setBindings({
        tempApplicationReference,
        sbi: application.organisation.sbi
      })

      resetFarmerApplyDataBeforeApplication(application)

      const newApplicationReference = await sendApplication({ ...application, type: applicationType.ENDEMICS }, request.yar.id)

      request.logger.setBindings({ newApplicationReference })

      if (newApplicationReference) {
        session.setFarmerApplyData(request, reference, newApplicationReference)
        session.setTempReference(request, tempReference, tempApplicationReference)

        const organisation = session.getFarmerApplyData(request, organisationKey)
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
        throw boom.internal('Apply declaration returned a null application reference.')
      }

      return h.view(endemicsConfirmation, {
        reference: newApplicationReference,
        isNewUser: userType.NEW_USER === application.organisation.userType,
        ruralPaymentsAgency: config.ruralPaymentsAgency,
        applySurveyUri: config.customerSurvey.uri,
        latestTermsAndConditionsUri: config.latestTermsAndConditionsUri
      })
    }
  }
}]
