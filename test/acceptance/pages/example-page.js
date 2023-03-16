const CommonActions = require('./common-actions')
// Page elements
const START_BUTTON = 'a[role="button"]'
const CONTINUE_BUTTON = '#submit'
const EMAIL_INPUT = '#email'
const ERROR_MESSAGE = '#email-error'
const LINK_MESSAGE = '.govuk-heading-l'

class LandingPage extends CommonActions {

async getHomePage (page) {
    await this.open(page)
}

async clickOnStartButton () {
    await this.clickOn(START_BUTTON)
}

async clickOnContinueButton () {
    await this.clickOn(CONTINUE_BUTTON)
}

async inputCredentials (credential) {
    await this.sendKey(EMAIL_INPUT, credential)
}

async verifyErrorMessage () {
    await this.elementToContainText(ERROR_MESSAGE,"Enter an email address in the correct format")
}
async magicLinkMessage(){
    await this.elementToContainText(LINK_MESSAGE,"Check your email")
}

}

module.exports = LandingPage