const session = require('../../session')
const config = require('../../config/index')
const urlPrefix = require('../../config/index').urlPrefix
const {
  timing,
  numbers,
  reviews,
  offerRejected
} = require('../../config/routes')

const pageUrl = `${urlPrefix}/${numbers}`
const backLink = `${urlPrefix}/${reviews}`
const nextPage = `${urlPrefix}/${timing}`

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
        return h.view(numbers, {
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
