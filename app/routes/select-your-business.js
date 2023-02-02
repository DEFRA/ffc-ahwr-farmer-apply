const Joi = require('joi')
const Boom = require('@hapi/boom')
const eligibilityApi = require('../api-requests/eligibility-api')
const urlPrefix = require('../config/index').urlPrefix
const { selectYourBusiness: { whichBusiness, eligibleBusinesses }, farmerApplyData: { organisation: organisationKey } } = require('../session/keys')

const session = require('../session')

const { selectYourBusinessRadioOptions } = require('./models/form-component/select-your-business-radio')
const { setFarmerApplyData, setSelectYourBusiness, getSelectYourBusiness } = require('../session')

const radioOptions = { isPageHeading: true, legendClasses: 'govuk-fieldset__legend--l', inline: false, undefined }
const errorText = 'Select the business you want reviewed'
const legendText = 'Choose the SBI you would like to apply for:'

module.exports = [{
  method: 'GET',
  path: `${urlPrefix}/select-your-business`,
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
      // todo get business from eligibility and layer on top new application API call and logic
      setSelectYourBusiness(request, eligibleBusinesses, businesses)
      if (businesses && businesses.length > 0) {
        return h.view('select-your-business',
          { ...selectYourBusinessRadioOptions(businesses, legendText, whichBusiness, getSelectYourBusiness(request, whichBusiness), undefined, radioOptions) }
        )
      } else {
        return h.redirect('no-eligible-businesses')
      }
    }
  }
},
{
  method: 'POST',
  path: `${urlPrefix}/select-your-business`,
  options: {
    validate: {
      payload: Joi.object({
        [whichBusiness]: Joi.string().required()
      }),
      failAction: (request, h, _err) => {
        return h
          .view(
            'select-your-business',
            {
              ...selectYourBusinessRadioOptions(
                getSelectYourBusiness(request, eligibleBusinesses),
                legendText,
                whichBusiness,
                getSelectYourBusiness(request, whichBusiness),
                errorText,
                radioOptions
              )
            }
          )
          .code(400)
          .takeover()
      }
    },
    handler: async (request, h) => {
      setSelectYourBusiness(request, whichBusiness, request.payload[whichBusiness])
      const businesses = getSelectYourBusiness(request, eligibleBusinesses)
      const selectedBusiness = businesses.find(business => {
        return business.sbi === request.payload[whichBusiness]
      })
      console.log(`${new Date().toISOString()} Selected business: ${JSON.stringify({
        ...selectedBusiness
      })}`)
      setFarmerApplyData(request, organisationKey, selectedBusiness)
      return h.redirect(`${urlPrefix}/org-review`)
    }
  }
}]
