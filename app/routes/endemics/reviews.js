const session = require('../../session')
const { agreeSameSpecies, organisation: organisationKey } = require('../../session/keys').farmerApplyData
const config = require('../../config/index')
const urlPrefix = require('../../config/index').urlPrefix
const {
  endemicsNumbers,
  endemicsReviews,
  endemicsCheckDetails,
  endemicsOfferRejected
} = require('../../config/routes')

const pageUrl = `${urlPrefix}/${endemicsReviews}`
const backLink = `${urlPrefix}/${endemicsCheckDetails}`
const nextPage = `${urlPrefix}/${endemicsNumbers}`

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

module.exports = [
  {
    method: 'GET',
    path: pageUrl,
    options: {
      handler: async (request, h) => {
        const organisation = session.getFarmerApplyData(request, organisationKey)
        return h.view(endemicsReviews, {
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
          session.setFarmerApplyData(
            request,
            agreeSameSpecies,
            'yes'
          )
          return h.redirect(nextPage)
        } else {
          session.setFarmerApplyData(
            request,
            agreeSameSpecies,
            'no'
          )
          session.clear(request)
          request.cookieAuth.clear()

          return h.view(endemicsOfferRejected, {
            title: 'You cannot continue with your application',
            ruralPaymentsAgency: config.ruralPaymentsAgency
          })
        }
      }
    }
  }
]
