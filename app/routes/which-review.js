const Joi = require('joi')
const { whichReview } = require('../session/keys').farmerApplyData
const { speciesRadios } = require('./models/form-component/species-radio')
const session = require('../session')

const legendText = 'Which livestock do you want a review for?'
const errorText = 'Select the livestock type you want reviewed'
const hintHtml = `<p>You can have one review each year for one type of livestock.</p>
<p>If you're eligible for more than one type of livestock, you must choose which one you want reviewed.</p>`
const backLink = '/org-review'
const radioOptions = { isPageHeading: true, legendClasses: 'govuk-fieldset__legend--l', inline: false, hintHtml }

module.exports = [
  {
    method: 'GET',
    path: '/which-review',
    options: {
      handler: async (request, h) => {
        return h.view('which-review', {
          ...speciesRadios(legendText, whichReview, session.getFarmerApplyData(request, whichReview), undefined, radioOptions),
          backLink
        })
      }
    }
  },
  {
    method: 'POST',
    path: '/which-review',
    options: {
      validate: {
        payload: Joi.object({
          [whichReview]: Joi.string().valid('sheep', 'pigs', 'dairy', 'beef').required()
        }),
        failAction: (request, h, _err) => {
          return h.view('which-review', {
            ...speciesRadios(legendText, whichReview, session.getFarmerApplyData(request, whichReview), errorText, radioOptions),
            backLink
          }).code(400).takeover()
        }
      },
      handler: async (request, h) => {
        session.setFarmerApplyData(request, whichReview, request.payload[whichReview])
        return h.redirect(`/${request.payload[whichReview]}-eligibility`)
      }
    }
  }
]
