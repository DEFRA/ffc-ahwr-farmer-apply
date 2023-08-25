const boom = require('@hapi/boom')
const Joi = require('joi')
const getDeclarationData = require('./models/declaration')
const session = require('../session')
const { declaration, reference, offerStatus, organisation: organisationKey, customer: crn } = require('../session/keys').farmerApplyData
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
      session.setFarmerApplyData(request, reference, null)
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
      const application = session.getFarmerApplyData(request)
      let applicationReference = application[reference]
      if (!applicationReference) {
        session.setFarmerApplyData(request, declaration, true)
        session.setFarmerApplyData(request, offerStatus, request.payload.offerStatus)
        applicationReference = await sendApplication(application, request.yar.id)

        if (applicationReference) {
          session.setFarmerApplyData(request, reference, applicationReference)
          const organisation = session.getFarmerApplyData(request, organisationKey)
          appInsights.defaultClient.trackEvent({
            name: 'agreement-created',
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
        return h.view('offer-rejected', { ruralPaymentsAgency: config.ruralPaymentsAgency })
      }

      if (!applicationReference) {
        // TODO: this requires a designed error screen for this scenario
        // as opposed to the generic screen that this will redirect to.
        console.log('Apply declaration returned a null application reference.')
        throw boom.internal()
      }

      return h.view('confirmation', {
        reference: applicationReference,
        ruralPaymentsAgency: config.ruralPaymentsAgency,
        applySurveyUri: config.customerSurvey.uri,
        latestTermsAndConditionsUri: config.latestTermsAndConditionsUri
      })
    }
  }
}]
