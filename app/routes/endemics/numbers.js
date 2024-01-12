const session = require('../../session')
const config = require('../../config/index')
const urlPrefix = require('../../config/index').urlPrefix
const {
  endemicsTiming,
  endemicsNumbers,
  endemicsReviews,
  endemicsOfferRejected
} = require('../../config/routes')

const pageUrl = `${urlPrefix}/${endemicsNumbers}`
const backLink = `${urlPrefix}/${endemicsReviews}`
const nextPage = `${urlPrefix}/${endemicsTiming}`

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
        return h.view(endemicsNumbers, {
          backLink,
          agreementStatus
        })
      }
    }
  },
  {
    method: 'POST',
    path: pageUrl,
    options: {
      handler: async (request, h) => {
        if (request.payload.agreementStatus === agreementStatus.notAgree.value) {
          session.clear(request)

          return h.view(endemicsOfferRejected, {
            title: 'Agreement terms rejected',
            ruralPaymentsAgency: config.ruralPaymentsAgency
          })
        }

        return h.redirect(nextPage)
      }
    }
  }
]
