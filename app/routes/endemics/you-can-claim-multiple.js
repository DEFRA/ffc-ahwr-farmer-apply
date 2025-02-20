import { keys } from '../../session/keys.js'
import { clear, getFarmerApplyData, setFarmerApplyData } from '../../session/index.js'
import { config } from '../../config/index.js'
import {
  endemicsCheckDetails,
  endemicsNumbers,
  endemicsOfferRejected,
  endemicsYouCanClaimMultiple
} from '../../config/routes.js'

const { agreeMultipleSpecies, organisation: organisationKey } = keys.farmerApplyData
const urlPrefix = config.urlPrefix

const pageUrl = `${urlPrefix}/${endemicsYouCanClaimMultiple}`
const backLink = `${urlPrefix}/${endemicsCheckDetails}`
const nextPage = `${urlPrefix}/${endemicsNumbers}`

const agreeStatusValue = 'yes'
const agreementStatuses = [
  {
    value: agreeStatusValue,
    text: 'I agree'
  },
  {
    value: 'no',
    text: 'I do not agree'
  }
]

export const claimMultipleRouteHandlers = [
  {
    method: 'GET',
    path: pageUrl,
    options: {
      handler: async (request, h) => {
        const organisation = getFarmerApplyData(request, organisationKey)
        return h.view(endemicsYouCanClaimMultiple, {
          backLink,
          agreementStatuses,
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
        const status = agreementStatuses.find((s) => s.value === request.payload.agreementStatus)

        setFarmerApplyData(
          request,
          agreeMultipleSpecies,
          status.value
        )

        if (status.value !== agreeStatusValue) {
          clear(request)
          request.cookieAuth.clear()
          return h.view(endemicsOfferRejected, {
            termsRejected: true,
            ruralPaymentsAgency: config.ruralPaymentsAgency
          })
        }

        return h.redirect(nextPage)
      }
    }
  }
]
