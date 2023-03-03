/// <reference types="cypress" />

import CommonAction from './common-action'

const START_BUTTON = 'a[role="button"]'
const EMAIL_INPUT = '#email'
const ERROR_MESSAGE = '#email-error'
const LINK_MESSAGE = '.govuk-heading-l'
class ApplyStartPage extends CommonAction {

    static openPage(page){
        this.navigateToPage(page)
    }

    static clickOnStartButton(){
        this.clickOn(START_BUTTON)
    }

    static inputCredentials (credential) {
        this.sendKeysWithEnterKey(EMAIL_INPUT, credential)
    }

    static verifyErrorMessage () {
       this.elementShouldIncludeText(ERROR_MESSAGE,"Enter an email address in the correct format")
    }

    static magicLinkMessage () {
        this.elementShouldIncludeText(LINK_MESSAGE, "Check your email")
    }
}

export default ApplyStartPage;