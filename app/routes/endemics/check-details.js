const Joi = require('joi')
const boom = require('@hapi/boom')
const config = require('../../config')
const session = require('../../session')
const { organisation: organisationKey, confirmCheckDetails } =
  require('../../session/keys').farmerApplyData
const getOrganisation = require('../models/organisation')
const { endemicsCheckDetails, endemicsReviews } = require('../../config/routes')

const pageUrl = `${config.urlPrefix}/${endemicsCheckDetails}`
const errorMessage = 'Select yes if these details are correct'

module.exports = [
  {
    method: 'GET',
    path: pageUrl,
    options: {
      handler: async (request, h) => {
        const organisation = session.getFarmerApplyData(
          request,
          organisationKey
        )
        if (!organisation) {
          return boom.notFound()
        }
        return h.view(
          endemicsCheckDetails,
          getOrganisation(request, organisation)
        )
      }
    }
  },
  {
    method: 'POST',
    path: pageUrl,
    options: {
      validate: {
        payload: Joi.object({
          [confirmCheckDetails]: Joi.string().valid('yes', 'no').required()
        }),
        failAction: (request, h, _err) => {
          const answer = request.payload[confirmCheckDetails]
          const organisation = session.getFarmerApplyData(
            request,
            organisationKey
          )
          // if (!answer) {
          //   return h.view(
          //     endemicsCheckDetails,
          //     {
          //       errorMessage: { text: 'Select you have read and agree to the terms and conditions' },
          //       ...getOrganisation(request, organisation, 'Select if your details are correct')
          //     }
          //   )
          // }
          if (!organisation) {
            return boom.notFound()
          }
          return h.view(
            endemicsCheckDetails,
            {
              errorMessage: { text: 'Select if your details are correct' },
              ...getOrganisation(request, organisation, 'Select if your details are correct')
            }
          )
            .code(400)
            .takeover()
        }
      },
      handler: async (request, h) => {
        const answer = request.payload[confirmCheckDetails]
        if (answer === 'yes') {
          session.setFarmerApplyData(
            request,
            confirmCheckDetails,
            request.payload[confirmCheckDetails]
          )
          return h.redirect(`${config.urlPrefix}/${endemicsReviews}`)
        }
        return h.view('update-details', {
          ruralPaymentsAgency: config.ruralPaymentsAgency,
          endemics: true
        })
      }
    }
  }
]
