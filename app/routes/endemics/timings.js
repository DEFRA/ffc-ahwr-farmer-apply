const session = require('../../session')
const urlPrefix = require('../../config/index').urlPrefix
const config = require('../../config/index')
const {
  endemicsNumbers,
  endemicsTimings,
  endemicsOfferRejected,
  endemicsDeclaration
} = require('../../config/routes')

const backLink = `${urlPrefix}/${endemicsNumbers}`

module.exports = [
  {
    method: 'GET',
    path: `${urlPrefix}/${endemicsTimings}`,
    options: {
      handler: async (request, h) => {
        return h.view('endemics/timings', {
          backLink
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
          return h.redirect(`${urlPrefix}/${endemicsDeclaration}`)
        } else {
          request.cookieAuth.clear()
          session.clear(request)
          return h.view(endemicsOfferRejected, {
            title: 'Agreement terms rejected',
            ruralPaymentsAgency: config.ruralPaymentsAgency
          })
        }
      }
    }
  }]
