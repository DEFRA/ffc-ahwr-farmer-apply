const boom = require('@hapi/boom')
const Joi = require('joi')
const session = require('../../session')
const { declaration, reference, offerStatus, organisation: organisationKey, customer: crn } = require('../../session/keys').farmerApplyData
const { sendApplication } = require('../../messaging/application')
const appInsights = require('applicationinsights')
const config = require('../../config/index')

module.exports = [{
  method: 'GET',
  path: `${config.urlPrefix}/endemics/declaration`,
  options: {
    handler: async (request, h) => {
      return h.view('endemics/declaration', { backLink: `${config.urlPrefix}/endemics/check-your-eligible`, latestTermsAndConditionsUri: `${config.latestTermsAndConditionsUri}?continue=true&backLink=${config.urlPrefix}/endemics/declaration` })
    }
  }
}, {
  method: 'POST',
  path: `${config.urlPrefix}/endemics/declaration`,
  options: {
    validate: {
      payload: Joi.object({
        offerStatus: Joi.string().required().valid('accepted', 'rejected'),
        terms: Joi.string().when('offerStatus', { is: 'accepted', then: Joi.valid('agree').required() })
      })
    },
    handler: async (request, h) => {
      const application = session.getFarmerApplyData(request)
      let applicationReference = application[reference]
      if (!applicationReference) {
        applicationReference = await sendApplication(application, request.yar.id)

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
        return h.view('offer-rejected', { ruralPaymentsAgency: config.ruralPaymentsAgency })
      }

      if (!applicationReference) {
        // TODO: this requires a designed error screen for this scenario
        // as opposed to the generic screen that this will redirect to.
        console.log('Apply declaration returned a null application reference.')
        throw boom.internal()
      }

      return h.view('endemics/confirmation', {
        reference: applicationReference,
        ruralPaymentsAgency: config.ruralPaymentsAgency,
        applySurveyUri: config.customerSurvey.uri,
        latestTermsAndConditionsUri: config.latestTermsAndConditionsUri
      })
    }
  }
}]
