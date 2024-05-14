const Joi = require('joi')
const boom = require('@hapi/boom')
const config = require('../../config')
const session = require('../../session')
const businessAppliedBefore = require('../../api-requests/business-applied-before')
const { organisation: organisationKey, confirmCheckDetails: confirmCheckDetailsKey } =
  require('../../session/keys').farmerApplyData
const getOrganisation = require('../models/organisation')
const { endemicsCheckDetails, endemicsReviews } = require('../../config/routes')

const pageUrl = `${config.urlPrefix}/${endemicsCheckDetails}`
const errorMessageText = 'Select if your details are correct'

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

        const userType = await businessAppliedBefore(organisation.sbi)
        session.setFarmerApplyData(
          request,
          organisationKey,
          { ...organisation, userType }
        )

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
          confirmCheckDetails: Joi.string().valid('yes', 'no').required()
        }),
        failAction: (request, h, _err) => {
          const organisation = session.getFarmerApplyData(
            request,
            organisationKey
          )
          if (!organisation) {
            return boom.notFound()
          }
          return h.view(
            endemicsCheckDetails,
            {
              errorMessage: { text: errorMessageText },
              ...getOrganisation(request, organisation, errorMessageText)
            }
          )
            .code(400)
            .takeover()
        }
      },
      handler: async (request, h) => {
        const { confirmCheckDetails } = request.payload
        session.setFarmerApplyData(request, confirmCheckDetailsKey, confirmCheckDetails)

        if (confirmCheckDetails === 'yes') {
          return h.redirect(`${config.urlPrefix}/${endemicsReviews}`)
        }

        return h.view('update-details', {
          ruralPaymentsAgency: config.ruralPaymentsAgency,
          endemics: config.endemics.enabled
        })
      }
    }
  }
]
