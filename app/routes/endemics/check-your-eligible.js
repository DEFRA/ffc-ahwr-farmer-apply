const Joi = require('joi')
const urlPrefix = require('../../config/index').urlPrefix
const session = require('../../session')
const { type } = require('../../session/keys').farmerApplyData

const backLink = `${urlPrefix}/endemics/org-review`

module.exports = [
  {
    method: 'GET',
    path: `${urlPrefix}/endemics/check-your-eligible`,
    options: {
      handler: async (request, h) => {
        return h.view('endemics/check-your-eligible', {
          backLink
        })
      }
    }
  },
  {
    method: 'POST',
    path: `${urlPrefix}/endemics/check-your-eligible`,
    options: {
      validate: {
        payload: Joi.object({
          continue: Joi.string().required().valid('continue'),
          terms: Joi.string().required().valid('agree')
        }),
        failAction: async (request, h) => {
          return h.view('endemics/check-your-eligible', {
            backLink,
            errorMessage: { text: 'Confirm you have read and understood what is required to have a review and follow-up visit' }
          }).code(400).takeover()
        }
      },
      handler: async (request, h) => {
        session.setFarmerApplyData(request, type, 'EE')
        return h.redirect(`${urlPrefix}/endemics/declaration`)
      }
    }
  }]
