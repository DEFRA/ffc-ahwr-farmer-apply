const boom = require('@hapi/boom')
const Joi = require('joi')
const session = require('../../session')
const { reference, declaration, offerStatus, organisation: organisationKey, customer: crn } = require('../../session/keys').farmerApplyData
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
      session.setFarmerApplyData(request, reference, null)
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
      const application = session.getFarmerApplyData(request)
      let applicationReference = application[reference]
      if (!applicationReference) {
        console.log('APPLICATION:', application)
        session.setFarmerApplyData(request, declaration, true)
        session.setFarmerApplyData(request, offerStatus, request.payload.offerStatus)
        applicationReference = await sendApplication({ ...application, type: applicationType.ENDEMICS }, request.yar.id)

        if (applicationReference) {
          session.setFarmerApplyData(request, reference, applicationReference)
          const organisation = session.getFarmerApplyData(request, organisationKey)
          appInsights.defaultClient.trackEvent({
            name: 'endemics-agreement-created',
            properties: {
              reference: applicationReference,
              sbi: organisation.sbi,
              crn: session.getCustomer(request, crn)
            }
          })
        }
      }

      session.clear(request)
      request.cookieAuth.clear()

      if (request.payload.offerStatus === 'rejected') {
        return h.view(endemicsOfferRejected, {
          title: 'Agreement offer rejected',
          ruralPaymentsAgency: config.ruralPaymentsAgency
        })
      }

      if (!applicationReference) {
        // TODO: this requires a designed error screen for this scenario
        // as opposed to the generic screen that this will redirect to.
        console.log('Apply declaration returned a null application reference.')
        throw boom.internal()
      }

      return h.view(endemicsConfirmation, {
        reference: applicationReference,
        isNewUser: userType.NEW_USER === application.organisation.userType,
        ruralPaymentsAgency: config.ruralPaymentsAgency,
        applySurveyUri: config.customerSurvey.uri,
        latestTermsAndConditionsUri: config.latestTermsAndConditionsUri
      })
    }
  }
}]
