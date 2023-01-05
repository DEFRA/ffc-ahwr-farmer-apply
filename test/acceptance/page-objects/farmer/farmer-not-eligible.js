import Pages from '../page'

class FarmerEligibility extends Pages {

  get eligibilityDetails () { return browser.$('//h1[contains(@class,\'govuk-heading-l\')]')}
  get eligibilityDetailsLink () { return browser.$('//a[contains(.,\'find out if you could be eligible for other farming schemes\')]')}


}
module.exports = new FarmerEligibility()
