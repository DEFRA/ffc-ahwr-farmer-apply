const session = require('../../session')
const { userType } = require('../../constants/user-types')
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
        const application = session.getFarmerApplyData(request)
        const organisation = session.getFarmerApplyData(request, organisationKey)
        return h.view(endemicsTimings, {
          isOldUser: userType.NEW_USER === application.organisation.userType,
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
            termsRejected: true,
            ruralPaymentsAgency: config.ruralPaymentsAgency
          })
        }
      }
    }
  }]
