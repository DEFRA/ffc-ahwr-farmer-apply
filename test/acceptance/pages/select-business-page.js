const CommonActions = require('./common-actions')

// select business element

const START_BUTTON = 'a[role="button"]'
const BUSINESS_EMAIL = '1105110119@email.com'
const RPA_CONTACT = '.govuk-details'
const PAGE_TITLE = 'Annual health and welfare review of livestock'
const SELECT_BUSINESS = 'Which business'
const BUSINESS_NAME = 'Farm'
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
// select livestock page
const WHICH_REVIEW = '.govuk-fieldset__heading'
const LIVESTOCK_TYPE = '[data-module="govuk-radios"]'
const SHEEP = '#whichReview-3'
const PIGS = '#whichReview-4'
const DAIRY_CATTLE = '#whichReview-2'
const BEEF_CATTLE = '#whichReview'
const LIVESTOCK = 'Sheep'
// eligibility page
const REQUIRE_LIVESTOCK_NUMBER = '#eligibleSpecies-hint'
const CONFIRM_ELIGIBILITY = '#eligibleSpecies'
const DECLARATION = '[role="button"]'
const TERMS_CONDITIONS = '#termsAndConditionsUri'
const TERMS_AND_CONDITION_BOX = '#terms'
const COMPLETE_APPLICATION = '[value="accepted"]'
const SUCCESS_MESSAGE = '.govuk-panel__title'
const ACCURATE_ANSWER = 'Check your answers'
const AGREED = 'declaration'
const REVIEW_AGREED = 'agreement'
const TERMS = 'Annual health and welfare review of livestock terms and conditions'
const MESSAGE = 'Application complete'
const LIVESTOCK_NUMBER = 'eligible for funding'

//'div.govuk-radios>div.govuk-radios__item>label'
//DefraID
const DEFRA_CRN = '#crn'
const DEFRA_PASSWORD = '#password'
const SIGN_IN_BUTTON = '[type="submit"]'
const EMAIL_INPUT = '#email'
const CONTINUE = '#submit'
const MUTLIPLE_BUSINESS_CONTINUE = '#continueReplacement'

class SelectBusinessPage extends CommonActions {

  async getHomePage(page) {
    await this.open(page)
  }
  async clickOnStartButton() {
    await this.clickOn(START_BUTTON)
  }

  async pageTitle() {
    await this.getPageTitle(PAGE_TITLE)
  }

  async businessPage() {
    await this.elementToContainText(CHECK_DETAILS, SELECT_BUSINESS)
  }

  async listOfBusiness() {
    await this.elementToContainText(BUSINESS_LIST, BUSINESS_NAME)
  }

  async selectBusiness() {
    await this.clickOn(BUSINESS_CHECK_BUTTON)
  }

  async checkContact() {
    await this.clickOn(RPA_CONTACT)
  }

  async contactDetails() {
    await this.elementToContainText(NO_BUSINESS_CONTENT, CONTACT)
  }

  async startApplication() {
    await this.clickOn(CONTINUE_BUTTON)
  }

  // org review
  async singleUserBusinessDetail() {
    const sleep = (waitTimeInMs) => new Promise(resolve => setTimeout(resolve, waitTimeInMs))
    await sleep(10000)
    await this.elementTextShouldBe(CHECK_DETAILS, DETAILS)
  }

  async checkFarmerDetails() {
    await this.elementToContainText(FARMER_DETAILS, CONTENT)
  }

  async farmerAcceptDetails() {
    await this.clickOn(DETAILS_BUTTON)
  }

  async proceedWithApplication() {
    await this.clickOn(CONTINUE_BUTTON)
  }

  async clickOnBusiness(businessName) {
    // Define the xPath function
    function xPath(businessName) {
      return `//*[@id="resultsContainer"]/div/fieldset/div/div[label[contains(text(),"${businessName}")]]/label`;
    }
    // Generate the XPath expression using the xPath function
    const xPathExpression = xPath(businessName);
    // Now you can use the xPathExpression in your WebDriverIO code
    const radio_Button = await $(xPathExpression);
    await this.clickOn(radio_Button)
  }
  // which-review
  async livestockPage() {
    await this.elementTextShouldBe(WHICH_REVIEW, REVIEW)
  }

  async livestockList() {
    await this.elementToContainText(LIVESTOCK_TYPE, LIVESTOCK)
  }
  async liveStockReview(LiveStockName) {
    switch (LiveStockName) {
      case 'Sheep':
        await this.clickOn(SHEEP);
        break;
      case 'Beef':
        await this.clickOn(BEEF_CATTLE);
        break;
      case 'Dairy':
        await this.clickOn(DAIRY_CATTLE);
        break;
      case 'Pigs':
        await this.clickOn(PIGS);
        break;
      default:
        // Handle the default case if needed
        break;
    }
  }

 
  async continueTheApplication() { await this.clickOn(CONTINUE_BUTTON) }
  // eligible livestock
  async minimumRequirement() {
    await this.elementToContainText(REQUIRE_LIVESTOCK_NUMBER, LIVESTOCK_NUMBER)
  }

  async accurateLivestockNumber() {
    await this.clickOn(CONFIRM_ELIGIBILITY)
  }

  async next() {
    await this.clickOn(CONTINUE_BUTTON)
  }

  async checkAnswerToBeAccurate() {
    await this.elementTextShouldBe(CHECK_DETAILS, ACCURATE_ANSWER)
  }

  async goToDeclaration() {
    await this.clickOn(DECLARATION)
  }

  // COMPLETE JOURNEY
  async declarationUrl() {
    await this.urlContain(AGREED)
  }

  async agreementReview() {
    await this.elementToContainText(CHECK_DETAILS, REVIEW_AGREED)
  }

  async conditionTab() {
    await this.clickOn(TERMS_CONDITIONS)
  }

  async termsAndConditionTitle() {
    await this.elementToContainText(CHECK_DETAILS, TERMS)
  }

  async agreeToTerms() {
    await this.clickOn(DECLARATION)
  }

  async termsCheckBox() {
    await this.clickOn(TERMS_AND_CONDITION_BOX)
  }

  async applicationCompleted() {
    await this.clickOn(COMPLETE_APPLICATION)
  }

  async successfulMessage() {
    await this.elementToContainText(SUCCESS_MESSAGE, MESSAGE)
  }
  async signInButton() {
    await this.clickOn(SIGN_IN_BUTTON)
  }

  async inputValidCrn(crn) {
    await this.sendKey(DEFRA_CRN, crn)
  }
  async inputPassword(password) {
    await this.sendKey(DEFRA_PASSWORD, password)
  }
  async submit() {
    await this.clickOn(CONTINUE)
  }
  async inputCredentials(credential) {
    await this.sendKey(EMAIL_INPUT, credential)
  }
  async signInWithDefraId(business) {
    const sleep = (waitTimeInMs) => new Promise(resolve => setTimeout(resolve, waitTimeInMs))
    await sleep(10000)
    if (business=='Single'){
        await this.inputValidCrn(process.env.CRN_USERNAME)
   
    }else if (business=='Multiple'){
      console.log(process.env.CRN_MULTI_USERNAME)
      await this.inputValidCrn(process.env.CRN_MULTI_USERNAME)
    }
    await this.inputPassword(process.env.CRN_PASSWORD)
    await this.signInButton()
    await sleep(10000)
  }
  async clickOnContinue() {
    await this.clickOn(MUTLIPLE_BUSINESS_CONTINUE)
  }
}
module.exports = SelectBusinessPage
