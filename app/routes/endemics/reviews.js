const session = require('../../session')
const boom = require('@hapi/boom')
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
    text: 'I do not agree – reject agreement'
  }
}

module.exports = [
  {
    method: 'GET',
    path: pageUrl,
    options: {
      handler: async (request, h) => {
        const organisation = session.getFarmerApplyData(request, organisationKey)
        if (!organisation) {
          return boom.notFound()
        }
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
            title: 'Agreement terms rejected',
            ruralPaymentsAgency: config.ruralPaymentsAgency
          })
        }
      }
    }
  }
]
