const session = require('../../session')
const boom = require('@hapi/boom')
const { agreeSpeciesNumbers, organisation: organisationKey } = require('../../session/keys').farmerApplyData
const config = require('../../config/index')
const urlPrefix = require('../../config/index').urlPrefix
const {
  endemicsTimings,
  endemicsNumbers,
  endemicsReviews,
  endemicsOfferRejected
} = require('../../config/routes')

const pageUrl = `${urlPrefix}/${endemicsNumbers}`
const backLink = `${urlPrefix}/${endemicsReviews}`
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
          session.setFarmerApplyData(
            request,
            agreeSpeciesNumbers,
            'yes'
          )
          return h.redirect(nextPage)
        } else {
          session.setFarmerApplyData(
            request,
            agreeSpeciesNumbers,
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
