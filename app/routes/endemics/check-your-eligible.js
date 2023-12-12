const Joi = require('joi')
const urlPrefix = require('../config/index').urlPrefix
const session = require('../../session')
const { type } = require('../../session/keys').farmerApplyData
const backLink = `${urlPrefix}`

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
          [species]: Joi.string().valid('yes', 'no').required()
        }),
      },
      handler: async (request, h) => {
        session.setFarmerApplyData(request, type, 'EE')
        return h.redirect(`${urlPrefix}/${redirect}`)
      }
    }
  }]
