const session = require('../../session')
const boom = require('@hapi/boom')
const { agreeVisitTimings, organisation: organisationKey } = require('../../session/keys').farmerApplyData
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
        const organisation = session.getFarmerApplyData(request, organisationKey)
        if (!organisation) {
          return boom.notFound()
        }
        return h.view(endemicsTimings, {
          backLink,
          organisation
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
          session.setFarmerApplyData(
            request,
            agreeVisitTimings,
            'yes'
          )
          return h.redirect(`${urlPrefix}/${endemicsDeclaration}`)
        } else {
          session.setFarmerApplyData(
            request,
            agreeVisitTimings,
            'no'
          )
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
