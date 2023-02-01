const Joi = require('joi')
const urlPrefix = require('../config/index').urlPrefix
const { selectYourBusiness: { whichBusiness, eligibleBusinesses }, farmerApplyData: { organisation: organisationKey } } = require('../session/keys')
const { selectYourBusinessRadioOptions } = require('./models/form-component/select-your-business-radio')
const { setFarmerApplyData, setSelectYourBusiness, getSelectYourBusiness } = require('../session')
const radioOptions = { isPageHeading: true, legendClasses: 'govuk-fieldset__legend--l', inline: false, undefined }
const errorText = 'Select the business you want reviewed'
const legendText = 'Choose the SBI you would like to apply for:'

module.exports = [{
  method: 'GET',
  path: `${urlPrefix}/select-your-business`,
  options: {
    handler: async (request, h) => {
      const businesses = [
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
      try {
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
      } catch (error) {
        console.log(error)
      }
    }
  }
}]
