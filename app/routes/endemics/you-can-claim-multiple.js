const session = require('../../session')
const { agreeMultipleSpecies, organisation: organisationKey } = require('../../session/keys').farmerApplyData
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

const agreementStatus = {
  agree: {
    value: 'agree',
    text: 'I agree',
    storedAnswer: 'yes'
  },
  notAgree: {
    value: 'notAgree',
    text: 'I do not agree',
    storedAnswer: 'yes'
  }
}

module.exports = [
  {
    method: 'GET',
    path: pageUrl,
    options: {
      handler: async (request, h) => {
        const organisation = session.getFarmerApplyData(request, organisationKey)
        return h.view(endemicsYouCanClaimMultiple, {
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
        if (request.payload.agreementStatus === agreementStatus.agree.value) {
          session.setFarmerApplyData(
            request,
            agreeMultipleSpecies, // TODO AHWR-233 agreeSameSpecies?
            agreementStatus.agree.storedAnswer
          )
          return h.redirect(nextPage)
        } else {
          session.setFarmerApplyData(
            request,
            agreeMultipleSpecies, // TODO AHWR-233 agreeSameSpecies?
            agreementStatus.notAgree.storedAnswer
          )
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
