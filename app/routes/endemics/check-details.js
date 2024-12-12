const Joi = require('joi')
const boom = require('@hapi/boom')
const config = require('../../config')
const session = require('../../session')
const businessAppliedBefore = require('../../api-requests/business-applied-before')
const {
  organisation: organisationKey,
  confirmCheckDetails: confirmCheckDetailsKey,
  reference: referenceKey
} = require('../../session/keys').farmerApplyData
const getOrganisation = require('../models/organisation')
const { endemicsCheckDetails, endemicsReviews, endemicsDetailsNotCorrect, endemicsMultipleSpeciesIntro } = require('../../config/routes')
const createTempReference = require('../../lib/create-temp-reference')

const pageUrl = `${config.urlPrefix}/${endemicsCheckDetails}`
const errorMessageText = 'Select if these details are correct'

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

        request.logger.setBindings({ sbi: organisation.sbi })

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
        const tempApplicationId = createTempReference()
        session.setFarmerApplyData(request, referenceKey, tempApplicationId)

        const { confirmCheckDetails } = request.payload
        session.setFarmerApplyData(request, confirmCheckDetailsKey, confirmCheckDetails)

        if (confirmCheckDetails === 'yes') {
          const urlSuffix = (config.multiSpecies.enabled) ? endemicsMultipleSpeciesIntro : endemicsReviews
          return h.redirect(`${config.urlPrefix}/${urlSuffix}`)
        }

        return h.view(endemicsDetailsNotCorrect, {
          ruralPaymentsAgency: config.ruralPaymentsAgency,
          title: 'Details are not correct',
          endemics: config.endemics.enabled
        })
      }
    }
  }
]
