const boom = require('@hapi/boom')
const Joi = require('joi')
const getDeclarationData = require('./models/declaration')
const session = require('../session')
const { declaration, reference, offerStatus, organisation: organisationKey, customer: crn } = require('../session/keys').farmerApplyData
const { tempReference } = require('../session/keys').tempReference
const { sendApplication } = require('../messaging/application')
const appInsights = require('applicationinsights')
const config = require('../config/index')

module.exports = [{
  method: 'GET',
  path: `${config.urlPrefix}/declaration`,
  options: {
    handler: async (request, h) => {
      const application = session.getFarmerApplyData(request)
      if (!application) {
        return boom.notFound()
      }
      const viewData = getDeclarationData(application)
      return h.view('declaration', { backLink: `${config.urlPrefix}/check-answers`, latestTermsAndConditionsUri: `${config.latestTermsAndConditionsUri}?continue=true&backLink=${config.urlPrefix}/declaration`, ...viewData })
    }
  }
}, {
  method: 'POST',
  path: `${config.urlPrefix}/declaration`,
  options: {
    validate: {
      payload: Joi.object({
        offerStatus: Joi.string().required().valid('accepted', 'rejected'),
        terms: Joi.string().when('offerStatus', { is: 'accepted', then: Joi.valid('agree').required() })
      }),
      failAction: async (request, h, _) => {
        const application = session.getFarmerApplyData(request)
        const viewData = getDeclarationData(application)
        return h.view('declaration', {
          backLink: `${config.urlPrefix}/check-answers`,
          ...viewData,
          errorMessage: { text: 'Confirm you have read and agree to the terms and conditions' }
        }).code(400).takeover()
      }
    },
    handler: async (request, h) => {
      session.setFarmerApplyData(request, declaration, true)
      session.setFarmerApplyData(request, offerStatus, request.payload.offerStatus)
      const tempApplicationReference = session.getFarmerApplyData(request, reference)
      const application = session.getFarmerApplyData(request)
      application.reference = null // Set application ref to null instead of temp ref before sending it to store.
      
      let newApplicationReference
      if (config.endemics.enabled) {
        newApplicationReference = await sendApplication({ ...application, type: 'VV' }, request.yar.id)
      } else {
        newApplicationReference = await sendApplication(application, request.yar.id)
      }

      if (newApplicationReference) {
        const organisation = session.getFarmerApplyData(request, organisationKey)
        session.setFarmerApplyData(request, reference, newApplicationReference)
        session.setTempReference(request, tempReference, tempApplicationReference)
        appInsights.defaultClient.trackEvent({
          name: 'agreement-created',
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
        return h.view('offer-rejected', { ruralPaymentsAgency: config.ruralPaymentsAgency })
      }

      if (!newApplicationReference) {
        // TODO: this requires a designed error screen for this scenario
        // as opposed to the generic screen that this will redirect to.
        console.log('Apply declaration returned a null application reference.')
        throw boom.internal()
      }

      return h.view('confirmation', {
        reference: newApplicationReference,
        ruralPaymentsAgency: config.ruralPaymentsAgency,
        applySurveyUri: config.customerSurvey.uri,
        latestTermsAndConditionsUri: config.latestTermsAndConditionsUri
      })
    }
  }
}]
