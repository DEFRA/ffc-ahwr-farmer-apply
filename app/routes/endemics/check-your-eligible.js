const Joi = require('joi')
const urlPrefix = require('../config/index').urlPrefix

const backLink = `${urlPrefix}/which-review`

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
          [eligibleSpecies]: Joi.string().valid('yes', 'no').required()
        }),
      },
      handler: async (request, h) => {
        return h.redirect(`${urlPrefix}/${redirect}`)
      }
    }
  }]
