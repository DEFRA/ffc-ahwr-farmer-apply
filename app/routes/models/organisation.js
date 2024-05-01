const session = require('../../session')
const auth = require('../../auth')
const { endemics } = require('../../config')
const { confirmCheckDetails } = require('../../session/keys').farmerApplyData
const { getYesNoRadios } = require('./form-component/yes-no-radios')

const labelText = 'Are your details correct?'

const formatAddressForDisplay = (organisation) => {
  return organisation?.address?.replaceAll(',', '<br>')
}

const getOrganisation = (request, organisation, errorText) => {
  const prevAnswer = session.getFarmerApplyData(request, confirmCheckDetails)
  const { crn } = session.getCustomer(request)
  const rows = [
    { key: { text: 'Farmer name' }, value: { text: organisation.farmerName } },
    { key: { text: 'Business name' }, value: { text: organisation.name } },
    { key: { text: 'SBI' }, value: { text: organisation.sbi } },
    { key: { text: 'CRN' }, value: { text: crn } },
    { key: { text: 'Organisation email address' }, value: { text: organisation.orgEmail } },
    { key: { text: 'User email address' }, value: { text: organisation.email } },
    {
      key: { text: 'Address' },
      value: { html: formatAddressForDisplay(organisation) }
    }
  ]

  const filteredRows = rows.filter((row) => {
    if (endemics.enabled) {
      return true
    }
    return row.key.text !== 'CRN number'
  })

  return {
    backLink: {
      href: auth.requestAuthorizationCodeUrl(session, request)
    },
    organisation,
    listData: { rows: filteredRows },
    ...getYesNoRadios(labelText, confirmCheckDetails, prevAnswer, errorText, {
      isPageHeading: false,
      legendClasses: 'govuk-fieldset__legend--m',
      inline: true
    })
  }
}

module.exports = getOrganisation
