import Pages from '../page'

class FarmerReview extends Pages {
  get updateDetails () { return browser.$('//h1[contains(@class,\'govuk-heading-l\')]')}
  get updateDetailsLink(){ return browser.$('//a[contains(.,\'update your details with the Rural Payments Agency\')]')}
  get eligibilityDetails () { return browser.$('//h1[contains(@class,\'govuk-heading-l\')]')}
  get eligibilityDetailsLink () { return browser.$('//a[contains(.,\'find out if you could be eligible for other farming schemes\')]')}
  open (token, email) {
    super.open('/verify-login?token=' + token + '&email=' + email)
    browser.pause(30000)
  }

}
module.exports = new FarmerReview()
