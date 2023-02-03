const Joi = require('joi')
const Boom = require('@hapi/boom')
const eligibilityApi = require('../api-requests/eligibility-api')
const config = require('../config/index')
const session = require('../session')
const sessionKeys = require('../session/keys')
const radios = require('./models/form-component/radios')

const ERROR_TEXT = 'Select the business you want reviewed'
const LEGEND_TEXT = 'Choose the SBI you would like to apply for:'
const RADIO_OPTIONS = { isPageHeading: true, legendClasses: 'govuk-fieldset__legend--l', inline: false, undefined }

module.exports = [{
  method: 'GET',
  path: `${config.urlPrefix}/select-your-business`,
  options: {
    validate: {
      query: Joi.object({
        businessEmail: Joi
          .string()
          .trim()
          .lowercase()
          .required()
          .email()
      }).options({
        stripUnknown: true
      }),
      failAction (request, h, err) {
        throw Boom.badRequest('"businessEmail" param is missing or the value is empty')
      }
    },
    handler: async (request, h) => {
      const businesses = await eligibilityApi.getBusinesses(request.query.businessEmail)
      if (!Array.isArray(businesses) || businesses.length === 0) {
        return h.redirect('no-eligible-businesses')
      }
      const checkedBusiness = session.getSelectYourBusiness(
        request,
        sessionKeys.selectYourBusiness.whichBusiness
      )
      session.setSelectYourBusiness(
        request,
        sessionKeys.selectYourBusiness.eligibleBusinesses,
        businesses
      )
      return h
        .view('select-your-business',
          radios(
            LEGEND_TEXT,
            sessionKeys.selectYourBusiness.whichBusiness,
            undefined,
            RADIO_OPTIONS
          )(businesses.map(business => ({
            value: business.sbi,
            text: `${business.sbi} - ${business.name}`,
            checked: checkedBusiness === business.sbi
          })))
        )
    }
  }
},
{
  method: 'POST',
  path: `${config.urlPrefix}/select-your-business`,
  options: {
    validate: {
      payload: Joi.object({
        [sessionKeys.selectYourBusiness.whichBusiness]: Joi.string().required()
      }),
      failAction: (request, h, _err) => {
        const businesses = session.getSelectYourBusiness(
          request,
          sessionKeys.selectYourBusiness.eligibleBusinesses
        )
        const checkedBusiness = session.getSelectYourBusiness(
          request,
          sessionKeys.selectYourBusiness.whichBusiness
        )
        return h
          .view('select-your-business',
            radios(
              LEGEND_TEXT,
              sessionKeys.selectYourBusiness.whichBusiness,
              ERROR_TEXT,
              RADIO_OPTIONS
            )(businesses.map(business => ({
              value: business.sbi,
              text: `${business.sbi} - ${business.name}`,
              checked: checkedBusiness === business.sbi
            })))
          )
          .code(400)
          .takeover()
      }
    },
    handler: async (request, h) => {
      session.setSelectYourBusiness(
        request,
        sessionKeys.selectYourBusiness.whichBusiness,
        request.payload[sessionKeys.selectYourBusiness.whichBusiness]
      )
      const selectedBusiness = session
        .getSelectYourBusiness(
          request,
          sessionKeys.selectYourBusiness.eligibleBusinesses
        )
        .find(business => business.sbi === request.payload[sessionKeys.selectYourBusiness.whichBusiness])
      session.setFarmerApplyData(
        request,
        sessionKeys.farmerApplyData.organisation,
        selectedBusiness
      )
      console.log(`${new Date().toISOString()} Selected business: ${JSON.stringify(selectedBusiness)}`)
      return h.redirect(`${config.urlPrefix}/org-review`)
    }
  }
}]
