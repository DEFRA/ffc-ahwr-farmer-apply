import { clear, getFarmerApplyData, setFarmerApplyData } from '../../session/index.js'
import { endemicsDeclaration, endemicsNumbers, endemicsOfferRejected, endemicsTimings } from '../../config/routes.js'
import { config } from '../../config/index.js'
import { keys } from '../../session/keys.js'

const { agreeVisitTimings, organisation: organisationKey } = keys.farmerApplyData
const urlPrefix = config.urlPrefix

const backLink = `${urlPrefix}/${endemicsNumbers}`

export const timingsRouteHandlers = [
  {
    method: 'GET',
    path: `${urlPrefix}/${endemicsTimings}`,
    options: {
      handler: async (request, h) => {
        const organisation = getFarmerApplyData(request, organisationKey)
        return h.view(endemicsTimings, {
          backLink,
          organisation
        })
      }
    }
  },
  {
    method: 'POST',
    path: `${urlPrefix}/${endemicsTimings}`,
    options: {
      handler: async (request, h) => {
        if (request.payload.agreementStatus === 'agree') {
          setFarmerApplyData(
            request,
            agreeVisitTimings,
            'yes'
          )
          return h.redirect(`${urlPrefix}/${endemicsDeclaration}`)
        }

        setFarmerApplyData(
          request,
          agreeVisitTimings,
          'no'
        )
        request.cookieAuth.clear()
        clear(request)

        return h.view(endemicsOfferRejected, {
          termsRejected: true,
          ruralPaymentsAgency: config.ruralPaymentsAgency
        })
      }
    }
  }]
