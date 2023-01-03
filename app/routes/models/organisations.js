const session = require('../../session')
const { organisations: organisationsKey } = require('../../session/keys')

const getOrganisations = (request, organisation, errorText) => {
  const organisations = session.getOrganisations(request, organisationsKey).map(o => {
    return {
      value: o.sbi,
      text: `${o.name} (${o.sbi})`,
      selected: o.sbi === organisation.sbi
    }
  })
  return {
    data:
    {
      name: 'select-organisation',
      hint: {
        text: 'Select one option.'
      },
      fieldset: {
        legend: {
          text: 'Please select one of organisation?',
          isPageHeading: true,
          classes: 'govuk-fieldset__legend--l'
        }
      },
      items: organisations,
      errorMessage: {
        text: errorText ?? ''
      }
    }
  }
}

module.exports = getOrganisations
