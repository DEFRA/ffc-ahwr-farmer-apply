import { clear, getFarmerApplyData, setFarmerApplyData } from '../../session/index.js'
import { config } from '../../config/index.js'
import { keys } from '../../session/keys.js'
import {
  endemicsNumbers,
  endemicsOfferRejected,
  endemicsReviews,
  endemicsTimings,
  endemicsYouCanClaimMultiple
} from '../../config/routes.js'

const { agreeSpeciesNumbers, organisation: organisationKey } = keys.farmerApplyData
const urlPrefix = config.urlPrefix

const pageUrl = `${urlPrefix}/${endemicsNumbers}`
const backLink = (config.multiSpecies.enabled) ? `${urlPrefix}/${endemicsYouCanClaimMultiple}` : `${urlPrefix}/${endemicsReviews}`
const nextPage = `${urlPrefix}/${endemicsTimings}`

const agreementStatus = {
  agree: {
    value: 'agree',
    text: 'I agree'
  },
  notAgree: {
    value: 'notAgree',
    text: 'I do not agree'
  }
}

export const numbersRouteHandlers = [
  {
    method: 'GET',
    path: pageUrl,
    options: {
      handler: async (request, h) => {
        console.log('in')
        const organisation = getFarmerApplyData(request, organisationKey)
        return h.view(endemicsNumbers, {
          backLink,
          agreementStatus,
          organisation
        })
      }
    }
  },
  {
    method: 'POST',
    path: pageUrl,
    options: {
      handler: async (request, h) => {
        if (request.payload.agreementStatus === 'agree') {
          setFarmerApplyData(
            request,
            agreeSpeciesNumbers,
            'yes'
          )
          return h.redirect(nextPage)
        } else {
          setFarmerApplyData(
            request,
            agreeSpeciesNumbers,
            'no'
          )
          clear(request)
          request.cookieAuth.clear()

          return h.view(endemicsOfferRejected, {
            termsRejected: true,
            ruralPaymentsAgency: config.ruralPaymentsAgency
          })
        }
      }
    }
  }
]
