const session = require('../../session')
const { confirmCheckDetails } = require('../../session/keys').farmerApplyData
const { getYesNoRadios } = require('./form-component/yes-no-radios')
const config = require('../../config')

const labelText = 'Are your details correct?'

const formatAddressForDisplay = (organisation) => {
  return organisation?.address?.replaceAll(',', '<br>')
}

const getOrganisation = (request, organisation, errorText) => {
  const prevAnswer = session.getFarmerApplyData(request, confirmCheckDetails)
  const rows = [
    { key: { text: 'Farmer name' }, value: { text: organisation.farmerName } },
    { key: { text: 'Business name' }, value: { text: organisation.name } },
    { key: { text: 'SBI number' }, value: { text: organisation.sbi } },
    {
      key: { text: 'Address' },
      value: { html: formatAddressForDisplay(organisation) }
    }
  ]
  return {
    backLink: {
      href: config.selectYourBusiness.enabled
        ? `/apply/select-your-business?businessEmail=${organisation.email}`
        : '/apply/start'
    },
    organisation,
    listData: { rows },
    ...getYesNoRadios(labelText, confirmCheckDetails, prevAnswer, errorText, {
      isPageHeading: false,
      legendClasses: 'govuk-fieldset__legend--m',
      inline: true
    })
  }
}

module.exports = getOrganisation
