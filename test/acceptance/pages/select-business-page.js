const CommonActions = require('./common-actions')
const getMagicLink = require('../support/get-magic-link')

// select business element
const BUSINESS_EMAIL = 'ibrahim.adekanmi@kainos.com'
const RPA_CONTACT = '.govuk-details'
const PAGE_TITLE = 'Annual health and welfare review of livestock'
const SELECT_BUSINESS = 'Which business'
const BUSINESS_NAME = 'Ibrahim Farm'
const CONTACT = 'Telephone'
const BUSINESS_CHECK_BUTTON = '#whichBusiness'
const NO_BUSINESS_CONTENT = '.govuk-details__text'
const BUSINESS_LIST = '[for="whichBusiness"]'
// org-review element
const CHECK_DETAILS = '.govuk-heading-l'
const FARMER_DETAILS = '.govuk-summary-list'
const DETAILS_BUTTON = '#confirmCheckDetails'
const CONTINUE_BUTTON = '#btnContinue'
const DETAILS = 'Check your details'
const CONTENT = 'Farmer name'
const REVIEW = 'Which livestock do you want a review for?'
//select livestock page
const WHICH_REVIEW = '.govuk-fieldset__heading'
const LIVESTOCK_TYPE = '[data-module="govuk-radios"]'
const SELECT_ANIMAL = '#whichReview-3'
const LIVESTOCK = 'Sheep'
//eligibility page
const REQUIRE_LIVESTOCK_NUMBER = '#eligibleSpecies-hint'
const CONFIRM_ELIGIBILITY = '#eligibleSpecies'
const DECLARATION = '[role="button"]'
const TERMS_CONDITIONS = '[href="/apply/terms"]'
const TERMS_AND_CONDITION_BOX = '#terms'
const COMPLETE_APPLICATION = '[value="accepted"]'
const SUCCESS_MESSAGE = '.govuk-panel__title'
const ACCURATE_ANSWER = 'Check your answers'
const AGREED = 'declaration'
const REVIEW_AGREED = 'agreement'
const TERMS = 'Accept the terms'
const MESSAGE = 'Application complete'
const LIVESTOCK_NUMBER = 'eligible for funding'

class SelectBusinessPage extends CommonActions {
  async magicLinkUrl () {
    const magicLink = await getMagicLink(BUSINESS_EMAIL)
    await browser.url(magicLink)
    await this.urlContain(BUSINESS_EMAIL)
  }

  async pageTitle () {
    await this.getPageTitle(PAGE_TITLE)
  }

  async businessPage () {
    await this.elementToContainText(CHECK_DETAILS, SELECT_BUSINESS)
  }

  async listOfBusiness () {
    await this.elementToContainText(BUSINESS_LIST, BUSINESS_NAME)
  }

  async selectBusiness () {
    await this.clickOn(BUSINESS_CHECK_BUTTON)
  }

  async checkContact () {
    await this.clickOn(RPA_CONTACT)
  }

  async contactDetails () {
    await this.elementToContainText(NO_BUSINESS_CONTENT, CONTACT)
  }

  async startApplication () {
    await this.clickOn(CONTINUE_BUTTON)
  }

  // org review
  async singleUserBusinessDetail () {
    await this.elementTextShouldBe(CHECK_DETAILS, DETAILS)
  }

  async checkFarmerDetails () {
    await this.elementToContainText(FARMER_DETAILS, CONTENT)
  }

  async farmerAcceptDetails () {
    await this.clickOn(DETAILS_BUTTON)
  }

  async proceedWithApplication () {
    await this.clickOn(CONTINUE_BUTTON)
  }

  // which-review
  async livestockPage () {
    await this.elementTextShouldBe(WHICH_REVIEW, REVIEW)
  }

  async livestockList () {
    await this.elementToContainText(LIVESTOCK_TYPE, LIVESTOCK)
  }

  async livestockToReview () {await this.clickOn(SELECT_ANIMAL)}

  async continueTheApplication () {await this.clickOn(CONTINUE_BUTTON)}

//eligible livestock
  async minimumRequirement () {
    await this.elementToContainText(REQUIRE_LIVESTOCK_NUMBER,LIVESTOCK_NUMBER)
  }

  async accurateLivestockNumber () {
    await this.clickOn(CONFIRM_ELIGIBILITY)
  }

  async next () {
    await this.clickOn(CONTINUE_BUTTON)
  }

  async checkAnswerToBeAccurate () {
    await this.elementTextShouldBe(CHECK_DETAILS, ACCURATE_ANSWER)
  }

  async goToDeclaration () {
    await this.clickOn(DECLARATION)
  }
//COMPLETE JOURNEY
  async declarationUrl(){
    await this.urlContain(AGREED)
  }
  async agreementReview(){
    await this.elementToContainText(CHECK_DETAILS,REVIEW_AGREED)
  }
  async conditionTab(){
    await this.clickOn(TERMS_CONDITIONS)
  }
  async termsAndConditionTitle(){
    await this.elementToContainText(CHECK_DETAILS,TERMS)
  }
  async agreeToTerms(){
    await this.clickOn(DECLARATION)
  }
  async termsCheckBox(){
    await this.clickOn(TERMS_AND_CONDITION_BOX)
  }

  async applicationCompleted(){
    await this.clickOn(COMPLETE_APPLICATION)
  }
  async successfulMessage(){
    await this.elementToContainText(SUCCESS_MESSAGE,MESSAGE)
  }
}
module.exports = SelectBusinessPage