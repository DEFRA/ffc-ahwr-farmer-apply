const CommonActions = require('./common-actions')
const getMagicLink = require('../support/get-magic-link')
// Page elements
const START_BUTTON = 'a[role="button"]'
const EMAIL_INPUT = '#email'
const ERROR_MESSAGE = '#email-error'
const LINK_MESSAGE = '.govuk-heading-l'
const CONTINUE_BUTTON = '#submit'
const BUSINESS_EMAIL = 'ibrahim.adekanmi@kainos.com'

class LandingPageActions extends CommonActions {
  async getHomePage (page) {
    await this.open(page)
  }

  async clickOnStartButton () {
    await this.clickOn(START_BUTTON)
  }

  async inputCredentials (credential) {
    await this.sendKey(EMAIL_INPUT, credential)
  }

  async clickOnContinueButton () {
    await this.clickOn(CONTINUE_BUTTON)
  }

  async verifyErrorMessage () {
    await this.elementToContainText(ERROR_MESSAGE,"Enter an email address in the correct format")
  }
  async magicLinkMessage(){
    await this.elementToContainText(LINK_MESSAGE,"Check your email")
  }

  async magicLinkUrl () {
    const magicLink = await getMagicLink(BUSINESS_EMAIL)
    await browser.url(magicLink)
  }

  async verifyPageTitle () {
    await this.elementToContainText()
  }
}

module.exports = LandingPageActions
