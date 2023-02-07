const Joi = require('joi')
const Boom = require('@hapi/boom')
const eligibilityApi = require('../api-requests/eligibility-api')
const applicationApi = require('../api-requests/application-api')
const config = require('../config/index')
const session = require('../session')
const sessionKeys = require('../session/keys')
const radios = require('./models/form-component/radios')
const BUSINESS_EMAIL_SCHEMA = require('../schemas/business-email.schema')

const ERROR_TEXT = 'Select the business you want reviewed'
const LEGEND_TEXT = 'Choose the SBI you would like to apply for:'
const RADIO_OPTIONS = { isPageHeading: true, legendClasses: 'govuk-fieldset__legend--l', inline: false, undefined }

const getAppliableBusinesses = async (businessEmail) => {
  const applicationStatus = {
    WITHDRAWN: 2,
    NOT_AGREED: 7
  }
  console.log(`${new Date().toISOString()} Getting latest applications for ${businessEmail}`)
  const latestApplications = await applicationApi.getLatestApplicationsBy(businessEmail)
  console.log(`${new Date().toISOString()} Latest Applications: ${JSON.stringify(latestApplications)}`)
  console.log(`${new Date().toISOString()} Getting eligible businesses for ${businessEmail}`)
  const eligibleBusinesses = await eligibilityApi.getEligibleBusinesses(businessEmail)
  console.log(`${new Date().toISOString()} Eligible Businesses: ${JSON.stringify(eligibleBusinesses)}`)
  return eligibleBusinesses.filter(business => {
    const index = latestApplications.findIndex(
      application => application.data.organisation.sbi.toString() === business.sbi.toString()
    )
    return index === -1 ||
      latestApplications[index].statusId === applicationStatus.WITHDRAWN ||
      latestApplications[index].statusId === applicationStatus.NOT_AGREED
  })
}

module.exports = [{
  method: 'GET',
  path: `${config.urlPrefix}/select-your-business`,
  options: {
    validate: {
      query: Joi.object({
        businessEmail: BUSINESS_EMAIL_SCHEMA
      }).options({
        stripUnknown: true
      }),
      failAction (request, h, err) {
        throw Boom.badRequest('"businessEmail" param is missing or the value is empty')
      }
    },
    handler: async (request, h) => {
      const appliableBusinesses = await getAppliableBusinesses(request.query.businessEmail)
      if (!Array.isArray(appliableBusinesses) || appliableBusinesses.length === 0) {
        console.log(`${new Date().toISOString()} No eligible business found`)
        return h.redirect('no-eligible-businesses')
      }
      session.setSelectYourBusiness(
        request,
        sessionKeys.selectYourBusiness.eligibleBusinesses,
        appliableBusinesses
      )
      const selectedBusiness = session.getSelectYourBusiness(
        request,
        sessionKeys.selectYourBusiness.whichBusiness
      )
      console.log(`${new Date().toISOString()} Appliable businesses: ${JSON.stringify(appliableBusinesses.map(business => business.sbi))}`)
      return h
        .view('select-your-business',
          radios(
            LEGEND_TEXT,
            sessionKeys.selectYourBusiness.whichBusiness,
            undefined,
            RADIO_OPTIONS
          )(appliableBusinesses.map(business => ({
            value: business.sbi,
            text: `${business.sbi} - ${business.name}`,
            checked: selectedBusiness === business.sbi
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
        console.log(`${new Date().toISOString()} Error on post request to ${config.urlPrefix}/select-your-business: ${_err}`)
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
