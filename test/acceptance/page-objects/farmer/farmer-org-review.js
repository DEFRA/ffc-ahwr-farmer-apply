import Pages from '../page'

class FarmerOrgReview extends Pages {
  get orgReviewQuestion () { return browser.$('//h1[@class=\'govuk-heading-l\'][contains(.,\'Check your details\')]') }
  get orgYesRadioOption () { return browser.$('//input[@value=\'yes\']') }
  get orgNoRadioOption () { return browser.$('#confirmCheckDetails-2') }

  open (token, email) {
    super.open('/apply/verify-login?token=' + token + '&email=' + email)
    browser.pause(30000)
  }

  async getOrgReviewQuestion () {
    await this.orgReviewQuestion.getText()
  }

  async selectYes () {
    await this.orgYesRadioOption.scrollIntoView()
    await browser.pause(3000)
    await (this.orgYesRadioOption).click()
  }

  async selectNo () {
    await this.orgNoRadioOption.click()
    await browser.pause(3000)
    await (this.orgNoRadioOption).click()
  }
}

module.exports = new FarmerOrgReview()
