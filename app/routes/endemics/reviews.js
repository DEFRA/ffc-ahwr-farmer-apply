const session = require('../../session')
const config = require('../../config/index')
const urlPrefix = require('../../config/index').urlPrefix
const {
  numbers,
  reviews,
  checkDetails,
  offerRejected
} = require('../../config/routes')

const pageUrl = `${urlPrefix}/${reviews}`
const backLink = `${urlPrefix}/${checkDetails}`
const nextPage = `${urlPrefix}/${numbers}`

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
        return h.view(reviews, {
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
        if (
          request.payload.agreementStatus === agreementStatus.notAgree.value
        ) {
          session.clear(request)

          return h.view(offerRejected, {
            title: 'Agreement terms rejected',
            ruralPaymentsAgency: config.ruralPaymentsAgency
          })
        }

        return h.redirect(nextPage)
      }
    }
  }
]
