const Joi = require('joi')
const urlPrefix = require('../config/index').urlPrefix
const { farmerApplyData: { organisation: organisationKey, whichBusiness, eligbleBusinesses } } = require('../session/keys')
const { selectYourBusinessRadioOptions } = require('./models/form-component/select-your-business-radio')
const { setFarmerApplyData, getFarmerApplyData } = require('../session')
const radioOptions = { isPageHeading: true, legendClasses: 'govuk-fieldset__legend--l', inline: false, undefined }
const errorText = 'Select the business you want reviewed'
const legendText = 'Choose the SBI you would like to apply for:'

module.exports = [{
  method: 'GET',
  path: `${urlPrefix}/select-your-business`,
  options: {
    handler: async (request, h) => {
      const eligbleBusinesses = [
        {
          sbi: '122333',
          crn: '112222',
          email: 'liam.wilson@kainos.com',
          farmerName: 'Mr Farmer',
          name: 'My Amazing Farm',
          address: '1 Some Road'
        },
        {
          sbi: '122334',
          crn: '112224',
          email: 'liam.wilson@kainos.com',
          farmerName: 'Mr Farmer',
          name: 'My Amazing Farm 2',
          address: '2 Some Road'
        }
      ]
      // todo get business from eligibility and layer on top new application API call and logic
      setFarmerApplyData(request, eligbleBusinesses, eligbleBusinesses)
      // todo if eligbleBusinesses is empty show an excpetion route
      return h.view('select-your-business',
        { ...selectYourBusinessRadioOptions(eligbleBusinesses, legendText, whichBusiness, getFarmerApplyData(request, whichBusiness), undefined, radioOptions) }
      )
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
        return h.view('select-your-business',
          { ...selectYourBusinessRadioOptions(legendText, whichBusiness, getFarmerApplyData(request, whichBusiness), errorText, radioOptions) }
        ).code(400).takeover()
      }
    },
    handler: async (request, h) => {
      setFarmerApplyData(request, whichBusiness, request.payload[whichBusiness])
      const businesses = getFarmerApplyData(request, eligbleBusinesses)
      const selectedBusiness = businesses.find(business => {
        return business.sbi === request.payload[whichBusiness]
      })
      console.log(`Selected business: ${JSON.stringify({
          ...selectedBusiness
        })}`)
      setFarmerApplyData(request, organisationKey, selectedBusiness)
      return h.redirect(`${urlPrefix}/org-review`)
    }
  }
}]
