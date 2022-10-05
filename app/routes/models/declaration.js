const species = require('../../constants/species')

function getSpeciesTestText (application) {
  switch (application.whichReview) {
    case species.beef:
      return 'allow a vet to test for bovine viral diarrhoea (BVD)'
    case species.dairy:
      return 'allow a vet to test for bovine viral diarrhoea (BVD)'
    case species.pigs:
      return 'allow a vet to test for porcine reproductive and respiratory syndrome (PRRS)'
    case species.sheep:
      return 'allow a vet to test for the effectiveness of worming treatments in sheep'
  }
}

function getSpeciesMinNumText (application) {
  switch (application.whichReview) {
    case species.beef:
      return "you'll have 11 or more beef cattle on the date the vet visits"
    case species.dairy:
      return "you'll have 11 or more dairy cattle on the date the vet visits"
    case species.pigs:
      return "you'll have 51 or more pigs on the date the vet visits"
    case species.sheep:
      return "you'll have 21 or more sheep on the date the vet visits"
  }
}

function getSpeciesApplicationText (application) {
  switch (application.whichReview) {
    case species.beef:
      return 'beef cattle'
    case species.dairy:
      return 'dairy cattle'
    case species.pigs:
      return 'pig'
    case species.sheep:
      return 'sheep'
  }
}

function getOrganisationForDisplay (application) {
  const organisation = { ...application.organisation }
  organisation.address = formatAddressForDisplay(organisation)
  return organisation
}

function formatAddressForDisplay (organisation) {
  return organisation?.address.replaceAll(',', '<br>')
}

function getDeclarationData (application) {
  return {
    organisation: getOrganisationForDisplay(application),
    minNumText: getSpeciesMinNumText(application),
    species: getSpeciesApplicationText(application),
    testText: getSpeciesTestText(application)
  }
}

module.exports = getDeclarationData
