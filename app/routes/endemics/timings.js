const Joi = require('joi')
const urlPrefix = require('../../config/index').urlPrefix
const {
  endemicsNumbers,
  endemicsTimings,
  endemicsOfferRejected,
  endemicsDeclaration
} = require('../../config/routes')

const backLink = `${urlPrefix}/${endemicsNumbers}`

module.exports = [
  {
    method: 'GET',
    path: `${urlPrefix}/${endemicsTimings}`,
    options: {
      handler: async (request, h) => {
        return h.view('endemics/timings', {
          backLink
        })
      }
    }
  },
  {
    method: 'POST',
    path: `${urlPrefix}/${endemicsTimings}`,
    options: {
      validate: {
        payload: Joi.object({
          agreementStatus: Joi.string().required().valid('agree', 'rejected')
        })
      },
      handler: async (request, h) => {
        // session.setFarmerApplyData(request, type, 'EE')
        if (request.payload.agreementStatus === 'agree') {
          return h.redirect(`${urlPrefix}/${endemicsDeclaration}`)
        } else {
          return h.redirect(`${urlPrefix}/${endemicsOfferRejected}`)
        }
      }
    }
  }]
