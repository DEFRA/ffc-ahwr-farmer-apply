const boom = require('@hapi/boom')
const session = require('../../session')
const { agreeVisitTimings } =
  require('../../session/keys').farmerApplyData
const { userType } = require('../../constants/user-types')
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
        const application = session.getFarmerApplyData(request)
        if (!application) {
          return boom.notFound()
        }
        return h.view(endemicsTimings, {
          backLink,
          isNewUser: userType.NEW_USER === application.organisation.userType
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
