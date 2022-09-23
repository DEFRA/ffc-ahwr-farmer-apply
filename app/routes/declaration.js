const boom = require('@hapi/boom')
const Joi = require('joi')
const getDeclarationData = require('./models/declaration')
const session = require('../session')
const { declaration, reference, offerStatus } = require('../session/keys').farmerApplyData
const { sendApplication } = require('../messaging/application')
const { clear } = require('../session')

module.exports = [{
  method: 'GET',
  path: '/declaration',
  options: {
    handler: async (request, h) => {
      const application = session.getFarmerApplyData(request)
      if (!application) {
        return boom.notFound()
      }
      const viewData = getDeclarationData(application)
      session.setFarmerApplyData(request, reference, null)
      return h.view('declaration', { backLink: '/check-answers', ...viewData })
    }
  }
}, {
  method: 'POST',
  path: '/declaration',
  options: {
    validate: {
      payload: Joi.object({
        terms: Joi.string().valid('agree').required(),
        offerStatus: Joi.string().valid('accepted', 'rejected'),
      }),
      failAction: async (request, h, _) => {
        const application = session.getFarmerApplyData(request)
        const viewData = getDeclarationData(application)
        return h.view('declaration', {
          backLink: '/check-answers',
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
        }
      }

      clear(request)

      if (request.payload.offerStatus === 'rejected') {
        return h.view('offer-rejected')
      }

      return h.view('confirmation', {
        reference: applicationReference
      })
    }
  }
}]
