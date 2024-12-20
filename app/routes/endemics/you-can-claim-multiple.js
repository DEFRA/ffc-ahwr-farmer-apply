const session = require('../../session')
const { agreeSameSpecies, organisation: organisationKey } = require('../../session/keys').farmerApplyData
const config = require('../../config/index')
const urlPrefix = require('../../config/index').urlPrefix
const {
  endemicsNumbers,
  endemicsYouCanClaimMultiple,
  endemicsCheckDetails,
  endemicsOfferRejected
} = require('../../config/routes')

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

module.exports = [
  {
    method: 'GET',
    path: pageUrl,
    options: {
      handler: async (request, h) => {
        const organisation = session.getFarmerApplyData(request, organisationKey)
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

        session.setFarmerApplyData(
          request,
          agreeSameSpecies, // NOTE AHWR-427 switch to agreeMultipleSpecies, once MI report supports it
          status.value
        )

        if (status.value !== agreeStatusValue) {
          session.clear(request)
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
