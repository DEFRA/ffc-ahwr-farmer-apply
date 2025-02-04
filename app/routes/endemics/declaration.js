import appInsights from 'applicationinsights'
import boom from '@hapi/boom'
import joi from 'joi'
import { keys } from '../../session/keys.js'
import { clear, getCustomer, getFarmerApplyData, setFarmerApplyData, setTempReference } from '../../session/index.js'
import { getDeclarationData } from '../models/declaration.js'
import { sendApplication } from '../../messaging/application/index.js'
import { applicationType, userType } from '../../constants/constants.js'
import { config } from '../../config/index.js'
import {
  endemicsConfirmation,
  endemicsDeclaration,
  endemicsOfferRejected,
  endemicsTimings
} from '../../config/routes.js'

const { reference, declaration, offerStatus, organisation: organisationKey, customer: crnKey } = keys.farmerApplyData

const resetFarmerApplyDataBeforeApplication = (application) => {
  // NOTE AHWR-426 investigate why these aren't being stored in the database
  delete application.agreeSpeciesNumbers
  delete application.agreeSameSpecies
  delete application.agreeMultipleSpecies
  delete application.agreeVisitTimings
}

export const declarationRouteHandlers = [{
  method: 'GET',
  path: `${config.urlPrefix}/${endemicsDeclaration}`,
  options: {
    handler: async (request, h) => {
      const application = getFarmerApplyData(request)
      if (!application) {
        return boom.notFound()
      }
      const viewData = getDeclarationData(application)
      return h.view(endemicsDeclaration, { backLink: `${config.urlPrefix}/${endemicsTimings}`, latestTermsAndConditionsUri: `${config.latestTermsAndConditionsUri}?continue=true&backLink=${config.urlPrefix}/${endemicsDeclaration}`, ...viewData })
    }
  }
}, {
  method: 'POST',
  path: `${config.urlPrefix}/${endemicsDeclaration}`,
  options: {
    validate: {
      payload: joi.object({
        offerStatus: joi.string().required().valid('accepted', 'rejected'),
        terms: joi.string().when('offerStatus', { is: 'accepted', then: joi.valid('agree').required() })
      }),
      failAction: async (request, h, _) => {
        const application = getFarmerApplyData(request)
        const viewData = getDeclarationData(application)
        return h.view(endemicsDeclaration, {
          backLink: `${config.urlPrefix}/${endemicsTimings}`,
          latestTermsAndConditionsUri: `${config.latestTermsAndConditionsUri}?continue=true&backLink=${config.urlPrefix}/${endemicsDeclaration}`,
          errorMessage: { text: 'Select you have read and agree to the terms and conditions' },
          ...viewData
        }).code(400).takeover()
      }
    },
    handler: async (request, h) => {
      setFarmerApplyData(request, declaration, true)
      setFarmerApplyData(request, offerStatus, request.payload.offerStatus)

      const crn = getCustomer(request, crnKey)
      const application = getFarmerApplyData(request)
      const tempApplicationReference = application.reference
      application.organisation.crn = crn

      request.logger.setBindings({
        tempApplicationReference,
        sbi: application.organisation.sbi
      })

      resetFarmerApplyDataBeforeApplication(application)

      const newApplicationReference = await sendApplication({ ...application, type: applicationType.ENDEMICS }, request.yar.id)

      request.logger.setBindings({ newApplicationReference })

      if (newApplicationReference) {
        setFarmerApplyData(request, reference, newApplicationReference)
        setTempReference(request, keys.tempReference, tempApplicationReference)

        const organisation = getFarmerApplyData(request, organisationKey)
        appInsights.defaultClient.trackEvent({
          name: 'endemics-agreement-created',
          properties: {
            reference: newApplicationReference,
            tempReference: tempApplicationReference,
            sbi: organisation.sbi,
            crn,
          }
        })
      }

      clear(request)
      request.cookieAuth.clear()

      if (request.payload.offerStatus === 'rejected') {
        return h.view(endemicsOfferRejected, {
          offerRejected: true,
          ruralPaymentsAgency: config.ruralPaymentsAgency
        })
      }

      if (!newApplicationReference) {
        throw boom.internal('Apply declaration returned a null application reference.')
      }

      return h.view(endemicsConfirmation, {
        reference: newApplicationReference,
        isNewUser: userType.NEW_USER === application.organisation.userType,
        ruralPaymentsAgency: config.ruralPaymentsAgency,
        applySurveyUri: config.customerSurvey.uri,
        latestTermsAndConditionsUri: config.latestTermsAndConditionsUri
      })
    }
  }
}]
