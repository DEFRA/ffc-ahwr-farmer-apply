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

const agreeStatusValue = 'agree'
const agreementStatuses = [
  {
    value: agreeStatusValue,
    text: 'I agree',
    storedAnswer: 'yes'
  },
  {
    value: 'notAgree',
    text: 'I do not agree',
    storedAnswer: 'no'
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
          agreementStatus: agreementStatuses,
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
          status.storedAnswer
        )

        if (status.value === agreeStatusValue) {
          return h.redirect(nextPage)
        } else {
          session.clear(request)
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
