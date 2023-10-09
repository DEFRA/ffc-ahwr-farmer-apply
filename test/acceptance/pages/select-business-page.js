const CommonActions = require('./common-actions')
const { expect } = require('chai')
const pgp = require('pg-promise')();

const databaseConfig = {
  user: 'adminuser@sndffcdbssq1002',
  host: 'sndffcdbssq1002.postgres.database.azure.com',
  port: 5432,
  database: 'ffc_ahwr_application',
};

// Dynamically set the password based on your requirements
const password = process.env.DB_PASSWORD;

// Create the connection string
const connectionString = `postgres://${databaseConfig.user}:${password}@${databaseConfig.host}:${databaseConfig.port}/${databaseConfig.database}`;

// Create the database connection
const db = pgp(connectionString);

// Now, 'db' is your database connection with the dynamic password.

// select business element

const START_BUTTON ='//*[@id="main-content"]/div/div/a' 
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
//Exception
const EXCEPTION_HEADER = '.govuk-heading-l'
const HEADER_ERROR_MESSAGE_EXPECTED = 'You cannot apply for a livestock review for this business'
const EXCEPTION_ERROR_MESSAGE = '.govuk-heading-l+.govuk-body'
const EXCEPTION_ERROR_MESSAGE_EXPECTED = 'You do not have the required permission to act for Test Estate - SBI 114441446.'
const EXCEPTION_ERROR_MESSAGE_EXPECTED_NO_CPH = 'Mr M A Burdon - SBI 200259426 has no eligible county parish holding (CPH) number registered to it.'
const EXCEPTION_ERROR_MESSAGE_EXPECTED_MB_NO_PERMISSION = 'You do not have the required permission to act for Dale Hitchens - SBI 107224622.'
const EXCEPTION_ERROR_MESSAGE_EXPECTED_MB_NO_CPH = 'Jazzmin Arundell - SBI 114522978 has no eligible county parish holding (CPH) number registered to it.'
const EXPECTED_ERROR='has already applied for an annual health and welfare review of livestock.'
const CALL_CHARGES = '.govuk-grid-column-full>p>.govuk-link'
const CALL_CHARGES_TITLE = 'Call charges and phone numbers - GOV.UK'
//10 month rule
const AGREEMENT_NUMBER = '.govuk-panel__body>strong'
const REJECT_OFFER='//*[@id="submitDeclarationForm"]/div[2]/button[2]'
let checkStatus_query
let updateStatus_query
let AGREEMENT_NUMBER_VALUE;
const actualStatus = 1;
let fetchedValue

class SelectBusinessPage extends CommonActions {

  async getHomePage(page) {
    await this.open(page)

  }
  async clickOnStartButton() {
    try{  
      const sleep = (waitTimeInMs) => new Promise(resolve => setTimeout(resolve, waitTimeInMs))
      await sleep(5000)
      await this.clickOn(START_BUTTON)
    }catch(error){
console.log(error.message)

    }
  
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

  async applicationCompleted(type) {
    if(type=='complete'){
      await this.clickOn(COMPLETE_APPLICATION)
    }else if (type=='reject'){
      await this.clickOn(REJECT_OFFER)
    }
    
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
    if (business == 'Single') {
      await this.inputValidCrn(process.env.CRN_USERNAME)
      await this.inputPassword(process.env.CRN_PASSWORD)

    } else if (business == 'Multiple') {
      console.log(process.env.CRN_MULTI_USERNAME)
      await this.inputValidCrn(process.env.CRN_MULTI_USERNAME)
      await this.inputPassword(process.env.CRN_PASSWORD)
    }
    else if (business == 'Exception-SB-NP') {
      console.log(process.env.CRN_EXCEPTION_USERNAME)
      await this.inputValidCrn(process.env.CRN_EXCEPTION_USERNAME)
      await this.inputPassword(process.env.CRN_EXCEPTION_PASSWORD)
    } else if (business == 'Exception-SB-NCPH') {
      console.log(process.env.CRN_EXCEPTION_USERNAME)
      await this.inputValidCrn(process.env.CRN_EXCEPTION_USERNAME_NOCPH)
      await this.inputPassword(process.env.CRN_PASSWORD)
    } else if (business == 'Exception-MB-NP') {
      console.log(process.env.CRN_EXCEPTION_USERNAME)
      await this.inputValidCrn(process.env.CRN_EXCEPTION_USERNAME_MB_NP)
      await this.inputPassword(process.env.CRN_PASSWORD)
    } else if (business == 'Exception-MB-NCPH') {
      console.log(process.env.CRN_EXCEPTION_USERNAME)
      await this.inputValidCrn(process.env.CRN_EXCEPTION_USERNAME_MB_NOCPH)
      await this.inputPassword(process.env.CRN_PASSWORD)
    }
    await this.signInButton()
    await sleep(10000)
  }
  async clickOnContinue() {
    await this.clickOn(MUTLIPLE_BUSINESS_CONTINUE)
  }

  //Exception

  async validateExceptionHeader() {
    const sleep = (waitTimeInMs) => new Promise(resolve => setTimeout(resolve, waitTimeInMs))
    await sleep(10000)
    await this.elementToContainText(EXCEPTION_HEADER, HEADER_ERROR_MESSAGE_EXPECTED)
  }

  async exceptionErrorMessage(typeOfException) {
    const sleep = (waitTimeInMs) => new Promise(resolve => setTimeout(resolve, waitTimeInMs))
    await sleep(10000)
  
    switch (typeOfException) {
      case 'SB-NO Permission':
        await this.elementToContainText(EXCEPTION_ERROR_MESSAGE, EXCEPTION_ERROR_MESSAGE_EXPECTED)
        break;
      case 'SB-NO CPH':
        await this.elementToContainText(EXCEPTION_ERROR_MESSAGE, EXCEPTION_ERROR_MESSAGE_EXPECTED_NO_CPH)
        break;
      case 'MB-NO Permission':
        await this.elementToContainText(EXCEPTION_ERROR_MESSAGE, EXCEPTION_ERROR_MESSAGE_EXPECTED_MB_NO_PERMISSION)
        break;
      case 'MB-NO CPH':
        await this.elementToContainText(EXCEPTION_ERROR_MESSAGE, EXCEPTION_ERROR_MESSAGE_EXPECTED_MB_NO_CPH)
        break;
      default:
        // Handle other cases or throw an error if needed
        break;
    }
  }
  
  async validateCallCharges() {
    await this.clickOn(CALL_CHARGES)
    //  let expectedPageTitle =await this.getPageTitle()
    // console.log('*************'+expectedPageTitle)
    const windowHandles = await browser.getWindowHandles();
    await browser.switchToWindow(windowHandles[1]);
    let expectedPageTitle = await this.getPageTitle()
    console.log(expectedPageTitle)
    await expect(expectedPageTitle).to.include(CALL_CHARGES_TITLE)
    await browser.closeWindow();
    await browser.switchToWindow(windowHandles[0]);

  }
  

  async connectTODatabase(type) {
    const sleep = (waitTimeInMs) => new Promise(resolve => setTimeout(resolve, waitTimeInMs))
    await sleep(5000)
    try {
      // Step 1: Define the Azure SQL Database connection configuration
      const conn = await db.connect();

      let query = '';
      let values = [];
      //const AGREEMENT_NUMBER_VALUE = 'your_agreement_number'; // Replace with actual value

      if (type === 'updateDate') {
        // Step 2: Update date in the database
        query = `
        UPDATE public.application
        SET "createdAt" ='2022-09-19T13:40:34.590Z',
            "updatedAt" = '2023-09-19T13:40:34.637Z'
        WHERE reference = $1;
      `;
        

        db.none(query, AGREEMENT_NUMBER_VALUE)
        .then(() => {
          console.log('Status updated successfully.');
        })
        .catch(error => {
          console.error('Error updating status:', error);
        })
        .finally(() => {
          // Close the database connection (optional)
          pgp.end();
        });
      } else if (type === 'updateStatus') {
        // Step 3: Update status in the database
        const updateStatusQuery = `
        UPDATE public.application
        SET "statusId" = 2
        WHERE reference = $1;
      `;
      
      const value =AGREEMENT_NUMBER_VALUE;  // The reference value
      ;
      
      db.none(updateStatusQuery, [value])
        .then(() => {
          console.log('Status updated successfully.');
        })
        .catch(error => {
          console.error('Error updating status:', error);
        })
        .finally(() => {
          // Close the database connection (optional)
         
        });
      
      } else if (type === 'checkStatus') {

        // Define a SQL query to fetch the value from the database
        const query = `
  SELECT "statusId" FROM public.application WHERE reference = $1;
`;
       
        // Execute the SQL query to fetch the value
        db.one(query,AGREEMENT_NUMBER_VALUE)
          .then(result => {
            // 'result' contains the value fetched from the database
            fetchedValue = result.statusId; // Corrected to access 'statusId' property
            console.log('Fetched Value:', fetchedValue);

            // You can now use 'fetchedValue' as needed in your code
          })
          .catch(error => {
            console.error('Error:', error);
          });
        // Release the connection
        conn.done();

      }else if (type === 'Incheck') {
        // Step 3: Update status in the database
        const updateStatusQuery = `
        UPDATE public.application
        SET "statusId" = 5
        WHERE reference = $1;
      `;
      
      const value =AGREEMENT_NUMBER_VALUE;  // The reference value
      ;
      
      db.none(updateStatusQuery, [value])
        .then(() => {
          console.log('Status updated successfully.');
        })
        .catch(error => {
          console.error('Error updating status:', error);
        })
        .finally(() => {
          // Close the database connection (optional)
          
        });
      
      }
    } catch (err) {
      console.error('Error:', err);
    }

    // Close the WebDriverIO browser session when done
    await browser.deleteSession();
 }

  async validAgreedStatus() {
    await this.elementValidateText(fetchedValue, actualStatus)
  }

  async getAgreementNumber() {
   console.log(browser.getCookies()) 
    AGREEMENT_NUMBER_VALUE = await this.elementGetText(AGREEMENT_NUMBER)
    return AGREEMENT_NUMBER_VALUE;

  }
  async validateExistingApplicationErrorMessage() {


  }

  async validateIncheckErrormessage(){

    await this.elementToContainText(EXCEPTION_ERROR_MESSAGE,EXPECTED_ERROR)
  }

  async closeBrowser1(){

    // Use the promise interface to close the browser
// Use the callback interface to close the browser
await this.closeBrowser()
   
  }

}
module.exports = SelectBusinessPage
